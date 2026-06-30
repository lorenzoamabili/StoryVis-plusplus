/**
 * Tests for provenance graph node access patterns documented in the codebase.
 * Uses the real ProvenanceGraph class — no Angular TestBed, no mocks.
 */
import {
  ProvenanceGraph,
  ProvenanceTracker,
  ActionFunctionRegistry,
  ProvenanceGraphTraverser,
} from '@visualstorytelling/provenance-core';

const APP = { name: 'storyvis-test', version: '1.0.0' };

// ── helpers ──────────────────────────────────────────────────────────────────

function makeGraph() {
  const graph    = new ProvenanceGraph(APP);
  const registry = new ActionFunctionRegistry();
  const tracker  = new ProvenanceTracker(registry, graph);
  const traverser = new ProvenanceGraphTraverser(registry, graph, tracker);
  return { graph, registry, tracker, traverser };
}

/** Walk every node DFS from root, return them in visit order. */
function walkAll(root: any): any[] {
  const out: any[] = [];
  const visit = (n: any) => { out.push(n); (n.children || []).forEach(visit); };
  visit(root);
  return out;
}

/** Walk path from root → current following the branch marked active. */
function currentPath(graph: ProvenanceGraph): any[] {
  const path: any[] = [];
  let node: any = graph.current;
  while (node) { path.unshift(node); node = node.parent; }
  return path;
}

// ── tests ─────────────────────────────────────────────────────────────────────

describe('ProvenanceGraph node access', () => {

  it('starts with a single root node', () => {
    const { graph } = makeGraph();
    const nodes = Object.values(graph.getNodes()) as any[];
    expect(nodes.length).toBe(1);
    expect(nodes[0].label).toBe('Root');
  });

  it('root node has no parent and empty children', () => {
    const { graph } = makeGraph();
    const root: any = graph.root;
    expect(root.parent).toBeUndefined();
    expect(root.children.length).toBe(0);
  });

  it('current equals root on fresh graph', () => {
    const { graph } = makeGraph();
    expect(graph.current.id).toBe(graph.root.id);
  });

  it('getNode(id) returns the same object as root', () => {
    const { graph } = makeGraph();
    expect(graph.getNode(graph.root.id)).toBe(graph.root);
  });

  it('getNode throws on unknown id', () => {
    const { graph } = makeGraph();
    expect(() => graph.getNode('does-not-exist')).toThrow();
  });

  it('adds a new node after applying an action', async () => {
    const { graph, registry, tracker } = makeGraph();
    let called = false;
    registry.register('noop', async () => { called = true; });

    await tracker.applyAction({
      metadata: { userIntent: 'exploration', label: 'test-action' },
      do: 'noop', doArguments: { args: [] },
      undo: 'noop', undoArguments: { args: [] },
    });

    expect(called).toBe(true);
    const nodes = Object.values(graph.getNodes());
    expect(nodes.length).toBe(2);
  });

  it('current advances to the new state node after action', async () => {
    const { graph, registry, tracker } = makeGraph();
    registry.register('noop', async () => {});

    const rootId = graph.root.id;
    await tracker.applyAction({
      metadata: { userIntent: 'exploration', label: 'advance' },
      do: 'noop', doArguments: { args: [] },
      undo: 'noop', undoArguments: { args: [] },
    }, true);

    expect(graph.current.id).not.toBe(rootId);
    expect((graph.current as any).parent.id).toBe(rootId);
  });

  it('new state node is a child of root', async () => {
    const { graph, registry, tracker } = makeGraph();
    registry.register('noop', async () => {});

    await tracker.applyAction({
      metadata: { userIntent: 'exploration', label: 'child' },
      do: 'noop', doArguments: { args: [] },
      undo: 'noop', undoArguments: { args: [] },
    }, true);

    expect((graph.root as any).children.length).toBe(1);
    expect((graph.root as any).children[0].id).toBe(graph.current.id);
  });

  it('walkAll visits every node exactly once', async () => {
    const { graph, registry, tracker } = makeGraph();
    registry.register('noop', async () => {});

    // apply 3 actions in sequence
    for (let i = 0; i < 3; i++) {
      await tracker.applyAction({
        metadata: { userIntent: 'exploration', label: `a${i}` },
        do: 'noop', doArguments: { args: [] },
        undo: 'noop', undoArguments: { args: [] },
      }, true);
    }

    const allById = Object.keys(graph.getNodes());
    const walked  = walkAll(graph.root).map((n: any) => n.id);
    expect(walked.length).toBe(allById.length);
    expect(new Set(walked).size).toBe(walked.length); // no duplicates
    allById.forEach(id => expect(walked).toContain(id));
  });

  it('currentPath traces parent chain back to root', async () => {
    const { graph, registry, tracker } = makeGraph();
    registry.register('noop', async () => {});

    await tracker.applyAction({
      metadata: { userIntent: 'exploration', label: 'p1' },
      do: 'noop', doArguments: { args: [] },
      undo: 'noop', undoArguments: { args: [] },
    }, true);
    await tracker.applyAction({
      metadata: { userIntent: 'exploration', label: 'p2' },
      do: 'noop', doArguments: { args: [] },
      undo: 'noop', undoArguments: { args: [] },
    }, true);

    const path = currentPath(graph);
    expect(path.length).toBe(3);              // root + 2 state nodes
    expect(path[0].id).toBe(graph.root.id);   // starts at root
    expect(path[path.length - 1].id).toBe(graph.current.id); // ends at current
  });

  it('traverser toStateNode moves current to parent (undo)', async () => {
    const { graph, registry, tracker, traverser } = makeGraph();
    registry.register('noop', async () => {});

    await tracker.applyAction({
      metadata: { userIntent: 'exploration', label: 'fwd' },
      do: 'noop', doArguments: { args: [] },
      undo: 'noop', undoArguments: { args: [] },
    }, true);

    const stateNodeId = graph.current.id;
    const parentId    = (graph.current as any).parent.id;

    await traverser.toStateNode(parentId, 0);
    expect(graph.current.id).toBe(parentId);

    await traverser.toStateNode(stateNodeId, 0);
    expect(graph.current.id).toBe(stateNodeId);
  });

  it('_isEmpty helper: true on fresh graph, false after first action', async () => {
    const { graph, registry, tracker } = makeGraph();
    registry.register('noop', async () => {});

    const isEmpty = (g: ProvenanceGraph) => {
      const root: any = (g as any).root;
      return !root || !root.children || root.children.length === 0;
    };

    expect(isEmpty(graph)).toBe(true);

    await tracker.applyAction({
      metadata: { userIntent: 'exploration', label: 'first' },
      do: 'noop', doArguments: { args: [] },
      undo: 'noop', undoArguments: { args: [] },
    }, true);

    expect(isEmpty(graph)).toBe(false);
  });
});
