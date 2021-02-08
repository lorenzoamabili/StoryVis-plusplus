import { ProvenanceNode } from "@visualstorytelling/provenance-core/src/api";
import { IHierarchyPointNodeWithMaxDepth } from "./gratzl";
import { IGroupedTreeNode } from "./utils";
import { getNodeIntent } from "./aggregation/aggregation-objects";

export interface NodeFilter<T> {
    name: string;
    userIntent: string;
}

//////// Objects that represent the different data aggregation algorithms///////////

/**Default Option as Raw Data */
export const defaultFilter: NodeFilter<ProvenanceNode> = {
    name: "select categories",
    userIntent: "none"
};
/**
 * @description Object of the interface DataAggregation<ProvenanceNode>.
 */
export const noFilters: NodeFilter<ProvenanceNode> = {
    name: "noFilters",
    userIntent: "none"
};
/**
 * @description Object of the interface DataAggregation<ProvenanceNode>.
 */
export const derivation: NodeFilter<ProvenanceNode> = {
    name: "derivation",
    userIntent: "derivation"
};
/**
 * @description Object of the interface DataAggregation<ProvenanceNode>.
 */
export const annotation: NodeFilter<ProvenanceNode> = {
    name: "annotation",
    userIntent: "annotation"
};
/**
 * @description Object of the interface DataAggregation<ProvenanceNode>.
 */
export const exploration: NodeFilter<ProvenanceNode> = {
    name: "exploration",
    userIntent: "exploration"
};
/**
 * @description Object of the interface DataAggregation<ProvenanceNode>.
 */
export const selection: NodeFilter<ProvenanceNode> = {
    name: "selection",
    userIntent: "selection"
};

export const provenance: NodeFilter<ProvenanceNode> = {
    name: "provenance",
    userIntent: "provenance"
};

/**
 * @description Object of the interface DataAggregation<ProvenanceNode>.
 */
export const configuration: NodeFilter<ProvenanceNode> = {
    name: "configuration",
    userIntent: "configuration"
};

export const filterObjects = [
    derivation, exploration, selection, configuration, annotation, provenance
];


export function filterTreeNodes(
    treeNodes: IHierarchyPointNodeWithMaxDepth<IGroupedTreeNode<any>>[],
    filters: NodeFilter<ProvenanceNode>[]
) {

    let filteredTreeNodes: IHierarchyPointNodeWithMaxDepth<IGroupedTreeNode<any>>[] = [];
    filteredTreeNodes.push(treeNodes[0]);
    if (filters) {
        for (const filter of filters) {
            treeNodes.filter((x) => getNodeIntent(x.data.wrappedNodes[0]) === filter.userIntent)
                .forEach(x => filteredTreeNodes.push(x));
        }
    }
    filteredTreeNodes.forEach(x => x.data.wrappedNodes[0].metadata.filtered = false);
    treeNodes.filter((x: any) => !filteredTreeNodes.includes(x)).forEach(x => x.data.wrappedNodes[0].metadata.filtered = true);
    return filteredTreeNodes;
}

//   export function filterLinkData(
//     treeNodes: IHierarchyPointNodeWithMaxDepth<IGroupedTreeNode<any>>[],
//     links: d3.HierarchyPointLink<IGroupedTreeNode<any>>[],
//     userIntent: string

//   ) {
//   }