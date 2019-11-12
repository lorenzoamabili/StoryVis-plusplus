import { StateNode, Action, IProvenanceTracker, IActionFunctionRegistry, IProvenanceGraph, IScreenShotProvider, SerializedProvenanceGraph } from './api';
/**
 * Provenance Graph Tracker implementation
 *
 * @param graph The provenance graph to track (this will serve as storage construct)
 * @param current Optional parameter to set current node for importing a provenance graph that is non-empty
 *
 */
export declare class ProvenanceTracker implements IProvenanceTracker {
    registry: IActionFunctionRegistry;
    /**
     * When acceptActions is false, the Tracker will ignore calls to applyAction
     */
    acceptActions: boolean;
    private graph;
    private username;
    private _screenShotProvider;
    private _autoScreenShot;
    constructor(registry: IActionFunctionRegistry, graph: IProvenanceGraph, username?: string);
    /**
     * Calls the action.do function with action.doArguments. This will also create a new StateNode
     * in the graph corresponding to the action taken. Optionally, the label set in action.metadata.label
     * will be taken as the label for this node.
     *
     * @param action
     * @param skipFirstDoFunctionCall If set to true, the do-function will not be called this time,
     *        it will only be called when traversing.
     */
    applyAction(action: Action, skipFirstDoFunctionCall?: boolean): Promise<StateNode>;
    screenShotProvider: IScreenShotProvider | null;
    autoScreenShot: boolean;
    getGraph(): SerializedProvenanceGraph;
    restoreGraph(sgraph: any): void;
}
