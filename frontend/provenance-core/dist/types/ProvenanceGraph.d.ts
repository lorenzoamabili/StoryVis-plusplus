import { Application, Handler, IProvenanceGraph, NodeIdentifier, ProvenanceNode, RootNode, SerializedProvenanceGraph, Artifact } from './api';
/**
 * Provenance Graph implementation
 *
 * @param version The version of the software to track the provenance of
 *
 */
export declare class ProvenanceGraph implements IProvenanceGraph {
    application: Application;
    readonly root: RootNode;
    artifacts: Artifact[];
    _current: ProvenanceNode;
    private _mitt;
    _nodes: {
        [key: string]: ProvenanceNode;
    };
    id: string;
    constructor(application: Application, userid?: string, node?: RootNode);
    addNode(node: ProvenanceNode): void;
    getNode(id: NodeIdentifier): ProvenanceNode;
    current: ProvenanceNode;
    readonly nodes: {
        [key: string]: ProvenanceNode;
    };
    emitNodeChangedEvent(node: ProvenanceNode): void;
    on(type: string, handler: Handler): void;
    off(type: string, handler: Handler): void;
    getSelf(): SerializedProvenanceGraph;
    restoreSelf(sgraph: SerializedProvenanceGraph): ProvenanceGraph;
}
export declare function restoreProvenanceGraph(serializedProvenanceGraph: SerializedProvenanceGraph): ProvenanceGraph;
export declare function serializeProvenanceGraph(graph: ProvenanceGraph): SerializedProvenanceGraph;
