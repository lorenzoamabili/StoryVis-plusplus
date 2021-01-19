import {
  IProvenanceGraphTraverser,
  ProvenanceNode,
  StateNode,
  IActionFunctionRegistry,
  IProvenanceGraph,
  NodeIdentifier,
  ActionFunctionWithThis,
  IProvenanceTracker,
  Handler
} from './api';
import { isReversibleAction, isStateNode } from './utils';
import mitt from './mitt';

function isNextNodeInTrackUp(currentNode: ProvenanceNode, nextNode: ProvenanceNode): boolean {
  if (isStateNode(currentNode) && currentNode.parent === nextNode) {
    return true;
  } else if (isStateNode(nextNode) && nextNode.parent !== currentNode) {
    // This is a guard against the illegitimate use of this function for unconnected nodes
    /* istanbul ignore next */
    throw new Error('Unconnected nodes, you probably should not be using this function');
  } else {
    return false;
  }
}

function findPathToTargetNode(
  currentNode: ProvenanceNode,
  targetNode: ProvenanceNode,
  track: ProvenanceNode[],
  comingFromNode: ProvenanceNode = currentNode
): boolean {
  if (currentNode && currentNode === targetNode) {
    track.unshift(currentNode);
    return true;
  } else if (currentNode) {
    // Map the StateNodes in the children StateEdges
    const nodesToCheck: ProvenanceNode[] = [...currentNode.children];

    // Add the parent node to that same list
    /* istanbul ignore else */
    if (isStateNode(currentNode)) {
      nodesToCheck.push(currentNode.parent);
    }

    for (const node of nodesToCheck) {
      // If the node to check is in the track already, skip it.
      if (node === comingFromNode) {
        continue;
      }
      /* istanbul ignore else */
      if (findPathToTargetNode(node, targetNode, track, currentNode)) {
        track.unshift(currentNode);
        return true;
      }
    }
  }
  /* istanbul ignore next */
  return false;
}

class IrreversibleError extends Error {
  invalidTraversal = true;
}

export class ProvenanceGraphTraverser implements IProvenanceGraphTraverser {
  public graph: IProvenanceGraph;
  public tracker: IProvenanceTracker | null;
  /**
   * trackingWhenTraversing === false disables tracking when traversing to prevent feedback.
   * When applying an action, the object we're tracking might trigger its event listeners. This
   * means that more Nodes are added to the ProvenanceGraph when traversing, which is most likely
   * unwanted behaviour.
   *
   * It will enable/disable immediately before/after calling the action. So if the event is emitted
   * asynchronously after the action, it will not work.
   */
  public trackingWhenTraversing = false;
  private registry: IActionFunctionRegistry;
  private _mitt: any;

  constructor(
    registry: IActionFunctionRegistry,
    graph: IProvenanceGraph,
    tracker: IProvenanceTracker | null = null
  ) {
    this.registry = registry;
    this.graph = graph;
    this.tracker = tracker;
    this._mitt = mitt();
  }

  async executeFunctions(
    functionsToDo: ActionFunctionWithThis[],
    argumentsToDo: any[],
    transitionTimes: number[]
  ): Promise<StateNode> {
    let result;
    for (let i = 0; i < functionsToDo.length; i++) {
      const funcWithThis = functionsToDo[i];
      let promise: any;
      if (this.tracker && this.tracker.acceptActions && !this.trackingWhenTraversing) {
        this.tracker.acceptActions = false;
        promise = funcWithThis.func.apply(funcWithThis.thisArg, argumentsToDo[i]);
        this.tracker.acceptActions = true;
      } else {
        promise = funcWithThis.func.apply(funcWithThis.thisArg, argumentsToDo[i]);
      }
      result = await promise;
    }
    return result;
  }


  /**
  * To copy a subtree with a split node as a root into another split node.
  *
  * @param id Node identifier
  */

  async copyNodes(
    id: NodeIdentifier,
    traverser?: ProvenanceGraphTraverser,
    transferring?: boolean
  ): Promise<any | undefined> {
    const currentNode = traverser ? traverser.graph.root : this.graph.current;
    const targetNode = traverser ? this.graph.root : this.graph.getNode(id);

    let tracker = this.tracker;
    let graph = this.graph;

    let nodesToMove: ProvenanceNode[] = [];
    let nodesAppended: ProvenanceNode[] = [];
    let previousChildren: ProvenanceNode[] = [];

    function copySubtree(currentNode: ProvenanceNode, targetNode: ProvenanceNode) {
      nodesToMove = [];
      previousChildren = [];
      if (currentNode && targetNode) {
        currentNode.children.forEach(nodeToMove => nodesToMove.push(nodeToMove));
        if (targetNode.children) {
          targetNode.children.forEach(previousChild => previousChildren.push(previousChild));
        }
        let i = -1;
        for (let nodeToMove of nodesToMove) {
          i = i + 1;
          appendNodes(nodeToMove, targetNode);
          goOneLevelDown(nodeToMove, nodesAppended, i);
        }
      }
    }

    function appendNodes(nodeToAppend: ProvenanceNode, rootNode: ProvenanceNode) {
      nodesAppended = [];
      graph.current = rootNode;
      if (transferring && nodeToAppend.metadata.option !== 'merged') {
        tracker?.applyAction((nodeToAppend as StateNode).action, true);
        (nodeToAppend as StateNode).metadata.option = 'merged';
      } else if (!transferring) {
        tracker?.applyAction((nodeToAppend as StateNode).action, true);
      }
      rootNode.children.forEach(nodeToAppend => nodesAppended.push(nodeToAppend));
      nodesAppended = nodesAppended.filter(nodeAppended => previousChildren.includes(nodeAppended) === false);
    }

    function goOneLevelDown(nodeToMove: ProvenanceNode, nodesAppended: ProvenanceNode[], rootIndex: number) {
      if (nodeToMove.children) {
        let lastNodeAppended = nodesAppended[rootIndex];
        copySubtree(nodeToMove, lastNodeAppended);
      }
    }

    this.graph.current = targetNode;
    const result = await copySubtree(currentNode, targetNode);

    return result;
  }



  /**
   * Finds shortest path between current node and node with request identifer.
   * Calls the do/undo functions of actions on the path.
   *
   * @param id Node identifier
   */

  async toStateNode(
    id: NodeIdentifier,
    transitionTime: number
  ): Promise<ProvenanceNode | undefined> {
    const currentNode = this.graph.current;
    const targetNode = this.graph.getNode(id);

    if (currentNode === targetNode) {
      return Promise.resolve(currentNode);
    }

    const trackToTarget: ProvenanceNode[] = [];

    const success = findPathToTargetNode(currentNode, targetNode, trackToTarget);

    /* istanbul ignore if */
    if (!success) {
      throw new Error('No path to target node found in graph');
    }

    let functionsToDo: ActionFunctionWithThis[], argumentsToDo: any[];
    let transitionTimes: number[] = [];
    try {
      const arg = this.getFunctionsAndArgsFromTrack(trackToTarget, transitionTime);
      functionsToDo = arg.functionsToDo;
      argumentsToDo = arg.argumentsToDo;
      functionsToDo.forEach((func: any) => {
        transitionTimes.push(transitionTime || 0);
      });
    } catch (error) {
      if (error.invalidTraversal) {
        this._mitt.emit('invalidTraversal', targetNode);
        return undefined;
      } else {
        /* istanbul ignore next */
        throw error; // should never happen
      }
    }


    const result = await this.executeFunctions(functionsToDo, argumentsToDo, transitionTimes);
    this.graph.current = targetNode;
    return result;
  }

  private getFunctionsAndArgsFromTrack(
    track: ProvenanceNode[],
    transitionTime: number
  ): {
    functionsToDo: ActionFunctionWithThis[];
    argumentsToDo: any[];
  } {
    const functionsToDo: ActionFunctionWithThis[] = [];
    const argumentsToDo: any[] = [];

    for (let i = 0; i < track.length - 1; i++) {
      const thisNode = track[i];
      const nextNode = track[i + 1];
      const up = isNextNodeInTrackUp(thisNode, nextNode);

      if (up) {
        /* istanbul ignore else */
        if (isStateNode(thisNode)) {
          if (!isReversibleAction(thisNode.action)) {
            throw new IrreversibleError('trying to undo an Irreversible action');
          }
          const undoFunc = this.registry.getFunctionByName(thisNode.action.undo);
          functionsToDo.push(undoFunc);
          if (thisNode.action.undo === "setPerspectiveCameraZoomLevel" ||
            thisNode.action.undo === "setPerspectiveCameraOrientation" ||
            thisNode.action.undo === "setSliceDrag" ||
            thisNode.action.undo === "setSliceZoom" ||
            thisNode.action.undo === "resetSlicesLocation" ||
            thisNode.action.undo === "setSlicesLocation" ||
            thisNode.action.undo === "resetConfig" ||
            thisNode.action.undo === "setConfig"
          ) {
            if (Math.abs(thisNode.metadata.creationOrder - nextNode.metadata.creationOrder) !== 1) {
              transitionTime = 10;
            }
            argumentsToDo.push(thisNode.action.undoArguments.args.concat([transitionTime]));
          } else {
            argumentsToDo.push(thisNode.action.undoArguments.args
              .concat(thisNode.action.undoArguments.artifacts ? thisNode.action.undoArguments.artifacts : []))
          }
        } else {
          /* istanbul ignore next */
          throw new Error('Going up from root? unreachable error ... I hope');
        }
      } else {
        /* istanbul ignore else */
        if (isStateNode(nextNode)) {
          const doFunc = this.registry.getFunctionByName(nextNode.action.do);
          functionsToDo.push(doFunc);
          if (nextNode.action.do === "setPerspectiveCameraZoomLevel" ||
            nextNode.action.do === "setPerspectiveCameraOrientation" ||
            nextNode.action.do === "setSliceDrag" ||
            nextNode.action.do === "setSliceZoom" ||
            nextNode.action.do === "resetSlicesLocation" ||
            nextNode.action.do === "setSlicesLocation" ||
            nextNode.action.do === "resetConfig" ||
            nextNode.action.do === "setConfig"
          ) {
            if (Math.abs(thisNode.metadata.creationOrder - nextNode.metadata.creationOrder) !== 1) {
              transitionTime = 10;
            }
            argumentsToDo.push(nextNode.action.doArguments.args.concat([transitionTime]));
          } else {
            argumentsToDo.push(nextNode.action.doArguments.args
              .concat(nextNode.action.doArguments.artifacts ? nextNode.action.doArguments.artifacts : []))
          }
        } else {
          /* istanbul ignore next */
          throw new Error('Going down to the root? unreachable error ... i hope');
        }
      }
    }

    return { functionsToDo, argumentsToDo };
  }

  // public getArtifactsFromTrack() {
  //   const artifacts: Artifact[] = [];
  //   const track: ProvenanceNode[] = [];
  //   for (let i = 0; i < track.length - 1; i++) {
  //     const thisNode = track[i];
  //       if (thisNode.artifacts !== []) {
  //         artifacts.push(thisNode.artifacts as any);
  //     }

  //     return artifacts;
  //   }
  // }


  on(type: string, handler: Handler) {
    this._mitt.on(type, handler);
  }

  off(type: string, handler: Handler) {
    this._mitt.off(type, handler);
  }

  // getTracker() : any{
  //   return this.tracker;
  // }
}
