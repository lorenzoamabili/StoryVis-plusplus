export interface IStoryVisBridge {
  provenance: {
    saveGraph: (id?: any) => void;
    saveStory: (id?: any) => void;
    generation: (newGraph?: boolean) => void;
    fission: () => void;
    splitting: () => void;
    transferring: (node: any) => void;
    merging: (currentNode: any, node: any) => void;
    copying: (node: any) => void;
  } | null;
  slideDeck: {
    onAdd: (node: any) => void;
    onDelete: (e: any, node: any) => void;
  } | null;
}

export const storyVisBridge: IStoryVisBridge = {
  provenance: null,
  slideDeck: null,
};
