import {
  Application,
  Handler,
  IProvenanceGraph,
  NodeIdentifier,
  ProvenanceNode,
  RootNode,
  StateNode,
  SerializedProvenanceGraph,
  SerializedProvenanceNode,
  SerializedStateNode,
  IScreenShotProvider,
  IScreenShot,
  Artifact
} from './api';
import { generateTimestamp, generateUUID, isStateNode } from './utils';
import mitt from './mitt';

/**
 * Provenance Graph implementation
 *
 * @param version The version of the software to track the provenance of
 *
 */
export class ProvenanceGraph implements IProvenanceGraph {
  public application: Application;
  public readonly root: RootNode;
  public artifacts: Artifact[] = [];
  public _current: ProvenanceNode;
  private _mitt: any;
  public _nodes: { [key: string]: ProvenanceNode } = {};
  public id: string;

  constructor(application: Application, userid: string = 'Unknown', node?: RootNode) {
    this.id = generateUUID();
    this._mitt = mitt();
    this.application = application;

    if (node) {
      this.root = node;
    } else {
      this.root = {
        id: generateUUID(),
        label: 'Root',
        metadata: {
          createdBy: userid,
          createdOn: generateTimestamp(),
          creationOrder: 0
        },
        children: []
      }
    }
    this.addNode(this.root);
    this._current = this.root;
  }

  addNode(node: ProvenanceNode): void {
    if (this._nodes[node.id]) {
      throw new Error('Node already added');
    }
    this._nodes[node.id] = node;
    this._mitt.emit('nodeAdded', node);

    if (node.artifacts) {
      this.artifacts.concat(node.artifacts);
    }
  }

  getNode(id: NodeIdentifier): ProvenanceNode {
    const result = this._nodes[id];
    if (!result) {
      throw new Error('Node id not found');
    }
    return this._nodes[id];
  }

  get current(): ProvenanceNode {
    return this._current;
  }

  set current(node: ProvenanceNode) {
    if (!this._nodes[node.id]) {
      throw new Error('Node id not found');
    }
    this._current = node;
    this._mitt.emit('currentChanged', node);
  }

  getNodes(): { [key: string]: ProvenanceNode } {
    return this._nodes;
  }

  setNodes(nodes: { [key: string]: ProvenanceNode }): any {
    this._nodes = nodes;
  }

  // mergedGraph(mergedGraphNodes: ProvenanceNode[], rootNode: ProvenanceNode): ProvenanceGraph {
  //   const nodes: { [key: string]: any } = {};

  //   for (const node of mergedGraphNodes) {
  //     let nodeId = node.id;
  //     nodes[node.id] = { ...node };

  //     if(node !== rootNode){
  //       nodes[node.id].parent = nodes[(node as any).parent];
  //     }
      
  //     // node.parent = nodes[node.parent];


  //     nodes[node.id].children = (node as any).children.map((nodeId: string) => nodes[nodeId]);

  //     console.log(nodes[node.id]);
  //   }
  //   console.log(mergedGraphNodes);
  //   console.log(nodes);

  //   for (const nodeId of Object.keys(nodes)) {
  //     const node = nodes[nodeId];
  //     node.children = node.children.map((id: string) => nodes[id]);
  //     if ('parent' in node) {
  //       node.parent = nodes[node.parent];
  //     }
  //   }

  //   console.log(nodes);

  //   const graph = new ProvenanceGraph(this.application, 'mergedGraph', nodes[rootNode.id]);
  //   graph._nodes = nodes;
  //   graph._current = nodes[nodes[rootNode.id]];


  //   const seriaNodes = Object.keys(graph.getNodes()).map(nodeId => {
  //     const node = graph.getNode(nodeId);
  //     node.metadata.loaded = true;
  //     const serializedNode: SerializedProvenanceNode = { ...node } as any;
  //     if (isStateNode(node)) {
  //       (serializedNode as SerializedStateNode).parent = node.parent.id;
  //     }
  //     console.log(serializedNode);

  //     serializedNode.children = node.children.map(child => child.id);
  //     return serializedNode;
  //   });

  //   const seriaGraph: SerializedProvenanceGraph =
  //   {
  //     nodes: seriaNodes,
  //     root: graph.root.id,
  //     application: graph.application,
  //     current: graph.current.id
  //   }
    
  //   const mergedGraph = restoreProvenanceGraph(seriaGraph);

  //   return mergedGraph;
  // }

  emitNodeChangedEvent(node: ProvenanceNode) {
    /* istanbul ignore if */
    if (!this._nodes[node.id]) {
      throw new Error('Node id not found');
    }
    this._mitt.emit('nodeChanged', node);
  }

  on(type: string, handler: Handler) {
    this._mitt.on(type, handler);
  }

  off(type: string, handler: Handler) {
    this._mitt.off(type, handler);
  }

  getSelf(): SerializedProvenanceGraph {
    return serializeProvenanceGraph(this);
  }

  restoreSelf(sgraph: SerializedProvenanceGraph): ProvenanceGraph {
    return restoreProvenanceGraph(sgraph);
  }
}

/* Beware that deeply nested properties in serializedProvenanceGraph are mutated in the process */
export function restoreProvenanceGraph(
  serializedProvenanceGraph: SerializedProvenanceGraph
): ProvenanceGraph {
  const nodes: { [key: string]: any } = {};

  // restore nodes as key value
  for (const node of serializedProvenanceGraph.nodes) {
    nodes[node.id] = { ...node };
    nodes[node.id].label = node.label;
  }

  // restore parent/children relations
  for (const nodeId of Object.keys(nodes)) {
    const node = nodes[nodeId];
    node.children = node.children.map((id: string) => nodes[id]);
    if ('parent' in node) {
      node.parent = nodes[node.parent];
    }
  }

  const graph = new ProvenanceGraph(serializedProvenanceGraph.application, 'restoredGraphUser', nodes[serializedProvenanceGraph.root]);
  graph._nodes = nodes;
  graph._current = nodes[serializedProvenanceGraph.root];
  return graph;
}

export function serializeProvenanceGraph(graph: ProvenanceGraph): SerializedProvenanceGraph {
  const nodes = Object.keys(graph.getNodes()).map(nodeId => {
    const node = graph.getNode(nodeId);
    node.metadata.loaded = true;
    const serializedNode: SerializedProvenanceNode = { ...node } as any;
    if (isStateNode(node)) {
      (serializedNode as SerializedStateNode).parent = node.parent.id;
    }
    serializedNode.children = node.children.map(child => child.id);
    return serializedNode;
  });


  return {
    nodes,
    root: graph.root.id,
    application: graph.application,
    current: graph.current.id
  };
}
