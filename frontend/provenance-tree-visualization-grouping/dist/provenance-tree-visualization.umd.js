(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('d3'), require('@visualstorytelling/provenance-core')) :
  typeof define === 'function' && define.amd ? define(['exports', 'd3', '@visualstorytelling/provenance-core'], factory) :
  (global = global || self, factory(global.provenanceTreeVisualization = {}, global.d3, global.provenanceCore));
}(this, (function (exports, d3, provenanceCore) { 'use strict';

  function depthSort(a, b) {
      if (a.maxDescendantDepth > b.maxDescendantDepth) {
          return -1;
      }
      else if (a.maxDescendantDepth < b.maxDescendantDepth) {
          return 1;
      }
      return 0;
  }
  function GratzlLayout(_root, _current) {
      var root = _root;
      var current = _current;
      var widths = [];
      // const maxY = Math.max.apply(null, root.leaves().map((leaf) => leaf.depth));
      function setTreeX(node, val) {
          node.x = val;
          node.y = node.depth;
          widths[node.depth] = val;
          if (node.children) {
              node
                  .leaves()
                  .sort(depthSort)
                  .forEach(function (leaf) {
                  if (typeof leaf.x === "undefined") {
                      var width = Math.max.apply(null, widths.slice(node.depth, leaf.depth + 1));
                      setTreeX(leaf, val > width ? val : width + 1);
                  }
              });
          }
          if (node.parent && typeof node.parent.x === "undefined") {
              setTreeX(node.parent, val);
          }
      }
      root.leaves().forEach(function (leaf) {
          leaf.ancestors().forEach(function (leafAncestor) {
              if (!leafAncestor.maxDescendantDepth ||
                  leaf.depth > leafAncestor.maxDescendantDepth) {
                  leafAncestor.maxDescendantDepth = leaf.depth;
              }
          });
      });
      /* start at the deepest leaf of activeNode. */
      var deepestLeaf = current;
      deepestLeaf.leaves().forEach(function (leaf) {
          if (deepestLeaf.depth < leaf.depth) {
              deepestLeaf = leaf;
          }
      });
      setTreeX(deepestLeaf, 0);
      //
      // const maxX = Math.max.apply(null, widths);
      // const maxY = Math.max.apply(null, root.leaves().map((leaf) => leaf.depth));
      // root.each((node) => {
      //   sizeNode(node, maxX, maxY);
      // });
      return root;
      //
      // const tree: IGratzlLayout<Datum> = Object.assign(
      //   (_root: HierarchyNode<Datum>, _activeNode: HierarchyNode<Datum>) => {
      //     /*
      //   * set maxDescendantDepth on each node,
      //   * which is the depth of its deepest child
      //   *
      //   * */
      //
      //     const root = _root as IHierarchyPointNodeWithMaxDepth<Datum>;
      //     const activeNode = _activeNode as IHierarchyPointNodeWithMaxDepth<Datum>;
      //
      //     root.leaves().forEach((leaf) => {
      //       leaf.ancestors().forEach((leafAncestor) => {
      //         if (
      //           !leafAncestor.maxDescendantDepth ||
      //           leaf.depth > leafAncestor.maxDescendantDepth
      //         ) {
      //           leafAncestor.maxDescendantDepth = leaf.depth;
      //         }
      //       });
      //     });
      //
      //     /* rendering should start at the deepest leaf of activeNode. */
      //     let deepestLeaf = activeNode;
      //     activeNode.leaves().forEach((leaf) => {
      //       if (deepestLeaf.depth < leaf.depth) {
      //         deepestLeaf = leaf;
      //       }
      //     });
      //
      //     setTreeX(deepestLeaf, 0);
      //
      //     const maxX = Math.max.apply(null, widths);
      //     const maxY = Math.max.apply(null, root.leaves().map((leaf) => leaf.depth));
      //     root.each((node) => {
      //       sizeNode(node, maxX, maxY);
      //     });
      //
      //     return root;
      //   },
      //   {
      //     size: ((x: [number, number] | undefined) => {
      //       return x ? ((dx = +x[0]), (dy = +x[1]), tree) : [dx, dy];
      //     }) as any,
      //   },
      // );
      //
      // function sizeNode(
      //   node: IHierarchyPointNodeWithMaxDepth<any>,
      //   maxX: number,
      //   maxY: number,
      // ): void {
      //   node.x = maxX === 0 ? dx : dx - (dx / maxX) * node.xOffset;
      //   node.y = maxY === 0 ? dy : (dy / maxY) * node.depth;
      // }
      // return tree;
  }

  /**
   * @description Child removed, child's children go to the parent.
   * @param node {IGroupedTreeNode<ProvenanceNode>} - Parent node
   * @param child {IGroupedTreeNode<ProvenanceNode>} - Child node
   */
  function transferToParent(node, child) {
      var _a, _b;
      node.children.splice(node.children.indexOf(child), 1);
      (_a = node.children).push.apply(_a, child.children);
      (_b = node.wrappedNodes).push.apply(_b, child.wrappedNodes);
  }
  /**
   * @description Child removed, child's children go to grandChild. GrandChild becomes node's child.
   * @param node {IGroupedTreeNode<ProvenanceNode>} - Parent node
   * @param child {IGroupedTreeNode<ProvenanceNode>} - Child node
   * @param grandChild {IGroupedTreeNode<ProvenanceNode>} - Child of the child node
   */
  function transferChildren(node, child, grandChild) {
      var _a, _b;
      node.children.splice(node.children.indexOf(child), 1);
      child.children.splice(child.children.indexOf(grandChild), 1);
      (_a = grandChild.wrappedNodes).push.apply(_a, child.wrappedNodes);
      (_b = grandChild.children).push.apply(_b, child.children);
      node.children.push(grandChild);
  }
  /**
   * @description Test whether a node should be constrained based on the currently selected node.
   * @param  node  {IGroupedTreeNode<ProvenanceNode>} - The node to test.
   * @param  node  {IGroupedTreeNode<ProvenanceNode>} - Currently selected node.
   */
  function shouldConstrain(node, selectedNode) {
      var result = false;
      var rawNode = node.wrappedNodes[0];
      if (node === selectedNode || rawNode.metadata.isSlideAdded) {
          result = true;
      }
      else if (node.children.includes(selectedNode)) {
          result = true;
      }
      else if (selectedNode.children.includes(node)) {
          result = true;
      }
      return result;
  }
  /**
   * @description Test whether a node is a leaf node.
   * @param  node  {IGroupedTreeNode<ProvenanceNode>} - The node to test.
   */
  function isLeafNode(node) {
      var result = false;
      if (node.children.length === 0) {
          result = true;
      }
      return result;
  }
  /**
   * @description Calculate the distance of this node to any node in the main (selected) branch.
   * @param  node  {IGroupedTreeNode<ProvenanceNode>} - The node to test.
   * @param  mainBranch  {Array<string>} - List of node ids which belong to the master branch.
   */
  function distanceToMainBranch(node, mainBranch) {
      var result = 0;
      if (mainBranch === undefined) {
          result = 0;
      }
      else if (provenanceCore.isStateNode(node) && mainBranch.includes(node.id)) {
          result = 0;
      }
      else {
          if (provenanceCore.isStateNode(node)) {
              result = 1 + distanceToMainBranch(node.parent, mainBranch);
          }
      }
      return result;
  }
  /**
   * @description Returns the maximum depth possible from the node selected.
   * @param node {IGroupedTreeNode<ProvenanceNode>} - Selected node
   * @returns Number of nodes you have to cross to go to the deepest leaf from the node selected.
   */
  var maxDepth = function (node) {
      if (node.children.length === 0) {
          return 1;
      }
      return Math.max.apply(Math, node.children.map(maxDepth)) + 1;
  };
  /**
   * @description Test everything.
   * @param tests {Array<NodeGroupTest<ProvenanceNode>>} - The tests to run
   * @param  node1  {IGroupedTreeNode<ProvenanceNode>} - Selected node #1
   * @param  node2  {IGroupedTreeNode<ProvenanceNode>} - Selected node #2
   * @returns true only if all tests return true
   */
  var testAll = function (tests, node1, node2) {
      var result = true;
      for (var _i = 0, tests_1 = tests; _i < tests_1.length; _i++) {
          var test_1 = tests_1[_i];
          result = test_1(node1, node2);
          if (!result) {
              break;
          }
      }
      return result;
  };
  // /**
  //  * @description Constrain neighbours
  //  * @param node {IGroupedTreeNode<ProvenanceNode>} - Node
  //  * @param selectedNode {IGroupedTreeNode<ProvenanceNode>} - Selected node
  //  */
  // export const neighbours = (node: IGroupedTreeNode<ProvenanceNode>, selectedNode: IGroupedTreeNode<ProvenanceNode>) => {
  //   let neighbour = false;
  //   if (node === selectedNode || selectedNode.children.includes(node) || node.children.includes(selectedNode)) {
  //     neighbour = true;
  //   }
  //   node.neighbour = neighbour;
  //   for (const child of node.children) {
  //     neighbours(child, selectedNode);
  //   }
  // };
  /////////////////// DIFFERENT DATA AGGREGATION ALGORITHM ///////////
  /**
   * @description No algorithm is applied. Created for a better understanding.
   * @param  node  {IGroupedTreeNode<ProvenanceNode>} - Root of the graph
   * @param  tests  {Array<NodeGroupTest<ProvenanceNode>>} - Test to be checked during execution.
   * @param  currentNode  {IGroupedTreeNode<ProvenanceNode>} -
   */
  var doNothing = function (currentNode, node, tests) { };
  /**
   * @param  node  {IGroupedTreeNode<ProvenanceNode>} - Root of the graph
   * @param  tests  {Array<NodeGroupTest<ProvenanceNode>>} - Tests to be checked during execution.
   */
  var group = function (currentNode, node, tests) {
      var merged = false;
      do {
          merged = false;
          for (var _i = 0, _a = node.children; _i < _a.length; _i++) {
              var child = _a[_i];
              if (!shouldConstrain(child, currentNode)) {
                  for (var _b = 0, _c = child.children; _b < _c.length; _b++) {
                      var grandChild = _c[_b];
                      if (testAll(tests, child, grandChild)) {
                          transferChildren(node, child, grandChild);
                          merged = true;
                          break;
                      }
                  }
                  if (merged) {
                      break;
                  }
              }
          }
      } while (merged);
      node.children.map(function (child) { return group(currentNode, child, tests); });
  };
  /**
   * @param  node  {IGroupedTreeNode<ProvenanceNode>} - Root of the graph
   * @param  tests  {Array<NodeGroupTest<ProvenanceNode>>} - Tests to be checked during execution.
   */
  var compress = function (currentNode, node, tests) {
      var merged = false;
      do {
          merged = false;
          for (var _i = 0, _a = node.children; _i < _a.length; _i++) {
              var child = _a[_i];
              if (!shouldConstrain(child, currentNode)) {
                  if (testAll(tests, node, child)) {
                      transferToParent(node, child);
                      merged = true;
                      break;
                  }
              }
          }
      } while (merged);
      node.children.map(function (child) { return compress(currentNode, child, tests); });
  };
  /**
   * @param  node  {IGroupedTreeNode<ProvenanceNode>} - Root of the graph
   * @param  tests  {Array<NodeGroupTest<ProvenanceNode>>} - Tests to be checked during execution.
   * @param mainBranch {Array<string>} - List of node's id which belong to the master branch.
   * @param arg {any} - Optinal parameter
   */
  var prune = function (currentNode, node, tests, mainBranch, arg) {
      var parameter = +arg;
      var merged = false;
      do {
          merged = false;
          var p = arg;
          for (var _i = 0, _a = node.children; _i < _a.length; _i++) {
              var child = _a[_i];
              if (!shouldConstrain(child, currentNode)) {
                  var dist = distanceToMainBranch(child.wrappedNodes[0], mainBranch);
                  if (isLeafNode(child)) {
                      if (dist <= p) {
                          transferToParent(node, child);
                          merged = true;
                      }
                  }
                  else {
                      for (var _b = 0, _c = child.children; _b < _c.length; _b++) {
                          var grandChild = _c[_b];
                          if (!shouldConstrain(grandChild, currentNode) &&
                              distanceToMainBranch(child.wrappedNodes[0], mainBranch) > 0) {
                              var childDepth = maxDepth(child);
                              if (dist + childDepth <= p) {
                                  transferChildren(node, child, grandChild);
                                  merged = true;
                              }
                          }
                      }
                  }
              }
          }
      } while (merged);
      node.children.map(function (child) {
          return prune(currentNode, child, tests, mainBranch, parameter);
      });
  };
  /**
   * @param  node  {IGroupedTreeNode<ProvenanceNode>} - Root of the graph
   * @param  test  {IGroupedTreeNode<ProvenanceNode>} - Test to be checked during execution.
   * @param arg {any} - Optinal parameter
   */
  var plotTrimmerFuncG = function (currentNode, node, tests, mainBranch, arg) {
      var parameter = +arg;
      var prunePar = 0;
      for (var i = 0; i <= parameter; i++) {
          if (i % 2 === 0 && i !== 0) {
              prunePar = prunePar + 1;
              prune(currentNode, node, tests, mainBranch, prunePar);
          }
          else {
              group(currentNode, node, tests);
          }
      }
  };
  /**
   * @param  node  {IGroupedTreeNode<ProvenanceNode>} - Root of the graph
   * @param  test  {IGroupedTreeNode<ProvenanceNode>} - Test to be checked during execution.
   * @param arg {any} - Optinal parameter
   */
  var plotTrimmerFuncC = function (currentNode, node, tests, mainBranch, arg) {
      var parameter = +arg;
      var prunePar = 0;
      for (var i = 0; i <= parameter; i++) {
          if (i % 2 === 0 && i !== 0) {
              prunePar = prunePar + 1;
              prune(currentNode, node, tests, mainBranch, prunePar);
          }
          else {
              compress(currentNode, node, tests);
          }
      }
  };

  /**
   * @description Getter for the user intent of the node selected.
   * @param  node  {IGroupedTreeNode<ProvenanceNode>} - Node selected.
   * @returns Returns the Intent of the user for the node selected.
   */
  function getNodeIntent(node) {
      if (provenanceCore.isStateNode(node) &&
          node.action &&
          node.action.metadata &&
          node.action.metadata.userIntent) {
          return node.action.metadata.userIntent;
      }
      return "none";
  }
  /**
   * @description Test whether a node is a key node or not.
   * @param  node  {IGroupedTreeNode<ProvenanceNode>} - Node selected.
   */
  function isKeyNode(node) {
      if (!provenanceCore.isStateNode(node) ||
          node.children.length === 0 ||
          node.children.length > 1 ||
          node.parent.children.length > 1 ||
          (node.children.length === 1 &&
              getNodeIntent(node) !== getNodeIntent(node.children[0]))) {
          return true;
      }
      return false;
  }
  /**
   * @description Returns a label for grouped nodes.
   * @param  node  {IGroupedTreeNode<ProvenanceNode>} - Node selected.
   */
  var groupNodeLabel = function (node) {
      if (node.wrappedNodes.length === 1) {
          return node.wrappedNodes[0].label;
      }
      else {
          return node.wrappedNodes[0].label;
      }
  };
  /**
   * @description Wraps a node and its children recursively
   * in an extra IGroupedTreeNode; which can be manipulated for grouping etc,
   * without modifying the (provenance) node.
   * @param  node  {IGroupedTreeNode<ProvenanceNode>} - Node selected.
   */
  var wrapNode = function (node) {
      return {
          wrappedNodes: [node],
          children: node.children.map(wrapNode),
          plotTrimmerValue: -1,
          neighbour: false,
          bookmarked: false
      };
  };
  /**
   * @description Test placeholder.
   * @param a {IGroupedTreeNode<ProvenanceNode>} - Node #1 to be tested.
   * @param b {IGroupedTreeNode<ProvenanceNode>} - Node #2 to be tested.
   */
  var testNothing = function (a, b) { return false; };
  /**
   * @description Test if b is an interval node.
   * @param a {IGroupedTreeNode<ProvenanceNode>} - Not used.
   * @param b {IGroupedTreeNode<ProvenanceNode>} - Node to be tested.
   */
  var testIsIntervalNode = function (a, b) { return b.children.length === 1; };
  /**
   * @description Object of the interface DataAggregation<ProvenanceNode>.
   */
  var rawData = {
      name: "Raw data",
      tests: [testNothing],
      algorithm: doNothing,
      arg: false,
      description: "No algorithm is applied. The full provenance data is shown."
  };
  /**
   * @description Object of the interface DataAggregation<ProvenanceNode>.
   */
  var plotTrimmerC = {
      name: "PlotTrimmer C",
      tests: [testIsIntervalNode],
      algorithm: plotTrimmerFuncC,
      arg: true,
      description: "Lorem Ipsum"
  };
  /**
   * @description Object of the interface DataAggregation<ProvenanceNode>.
   */
  var plotTrimmerG = {
      name: "PlotTrimmer G",
      tests: [testIsIntervalNode],
      algorithm: plotTrimmerFuncG,
      arg: true,
      description: "Lorem Ipsum"
  };

  var legendData = {
      legends: [
          {
              name: 'bookmark',
              color: '#fff',
              shape: 'circle',
              opacity: 0.3
          },
          {
              name: 'exploration',
              color: '#8dd3c7',
              shape: 'circle',
              opacity: 0.3
          },
          {
              name: 'selection',
              color: '#80b1d3',
              shape: 'circle',
              opacity: 0.3
          },
          {
              name: 'configuration',
              color: '#fdb462',
              shape: 'circle',
              opacity: 0.3
          },
          {
              name: 'derivation',
              color: '#fb8072',
              shape: 'circle',
              opacity: 0.3
          },
          {
              name: 'provenance',
              color: '#bebada',
              shape: 'circle',
              opacity: 0.3
          },
          {
              name: 'annotation',
              color: '#ffffb3',
              shape: 'circle',
              opacity: 0.3
          }
      ],
      commands: [
          'HOW TO PERFORM SOME INTERACTIONS:',
          '- RIGHT CLICK+MOUSE MOVE on imaging data = To zoom the imaging data',
          '- SHIFT+CLICK on imaging data = To magnify a view',
          '- ALT+RIGHT CLICK on measurements = To delete a measurement',
          '- RIGHT CLICK on graph nodes = To bookmark a node',
          '- SCROLL on graph = To zoom the graph',
          '- SCROLL on storyline = To scale the graph',
          '- SCROLL+SHIFT on storyline = To slide the graph'
      ],
      instructions: [
          'TASKS TO BE PERFORMED:',
          '- TASK 1 = Explore the imaging data to find all nodules/anomalies in it.',
          '- TASK 2 = Measure the diameter of all the nodules/anomalies found in the imaging data.',
          '- TASK 3 = Create annotations and/or make additional measurements on the nodules/anomalies found in the imaging data.',
          '- TASK 4 = Create a report to communicate your findings to collaborators.'
      ]
  };
  function addLegend(elm) {
      var legendContainer = elm.append('div').attr('class', 'legend').attr('id', 'legendContainer').attr('style', 'display: none;');
      var legendList = legendContainer.append('ul');
      var listItem = legendList
          .selectAll('li')
          .data(legendData.legends)
          .enter()
          .append('li');
      listItem
          .append('div')
          .attr('class', function (d) {
          if (d.name === 'bookmark') {
              return 'bookmark';
          }
          else if (d.name === 'story') {
              return 'story';
          }
          else if (d.name === 'loaded') {
              return 'loaded';
          }
          else {
              return 'circle';
          }
      })
          .attr('style', function (d) { return "background-color:" + d.color; });
      listItem.append('span').text(function (d) {
          return d.name;
      });
  }
  function addCommandsList(elm) {
      var commandsContainer = elm.append('div').attr('class', 'legend')
          .attr('id', 'commandsContainer').attr('style', 'display: none;');
      var commandsList = commandsContainer.append('ul');
      var commandsListItem = commandsList
          .selectAll('li')
          .data(legendData.commands)
          .enter()
          .append('li');
      commandsListItem
          .append('div');
      commandsListItem.append('span').text(function (d) {
          return d;
      });
  }
  function addInstructionsList(elm) {
      var instructionsContainer = elm.append('div').attr('class', 'legend')
          .attr('id', 'instructionsContainer').attr('style', 'margin-bottom: 50px; display: none;');
      var instructionsList = instructionsContainer.append('ul');
      var instructionsListItem = instructionsList
          .selectAll('li')
          .data(legendData.instructions)
          .enter()
          .append('li');
      instructionsListItem
          .append('div');
      instructionsListItem.append('span').text(function (d) {
          return d;
      });
  }

  /**
   * @description Show the buttons of the user interface.
   */
  function addAggregationButtons(elm, provenanceTreeVisualization) {
      var container = elm.append('div').attr('class', 'container');
      // const holder = container.append('div');
      addLegend(container);
      addCommandsList(container);
      addInstructionsList(container);
      // legendButton
      var legendButton = provenanceTreeVisualization.container
          .append('button')
          .attr('id', 'minimap-trigger')
          .attr('class', 'mat-icon-button mat-button-base mat-primary')
          .attr('color', 'primary')
          .attr('style', 'position: absolute; color: orange; z-index: 1; bottom: 2px; background-color: snow;')
          .attr('ng-reflect-color', 'primary')
          .on('mousedown', function () {
          var visible = d3.select("#legendContainer").style('display') === 'block';
          if (visible) {
              d3.select("#legendContainer").style('display', 'none');
              d3.select("#commandsContainer").style('display', 'none');
              d3.select("#instructionsContainer").style('display', 'none');
              provenanceTreeVisualization.update();
              // provenanceTreeVisualization.scaleToFit();
          }
          else {
              d3.select("#legendContainer").style('display', 'block');
              d3.select("#commandsContainer").style('display', 'block');
              d3.select("#instructionsContainer").style('display', 'block');
              provenanceTreeVisualization.update();
              // provenanceTreeVisualization.scaleToFit();
          }
      });
      legendButton
          .append('span')
          .attr('class', 'mat-button-wrapper')
          .append('mat-icon')
          .attr('class', 'mat-icon notranslate material-icons mat-icon-no-color')
          .attr('role', 'img')
          .attr('aria-hidden', 'true')
          .text('list');
      legendButton
          .append('div')
          .attr('class', 'mat-button-ripple mat-ripple mat-button-ripple-round')
          .attr('ng-reflect-centered', 'true')
          .attr('ng-reflect-disabled', 'false')
          .attr('ng-reflect-trigger', '[object HTMLButtonElement]');
      legendButton
          .append('div')
          .attr('class', 'mat-button-focus-overlay');
  }

  /**
   * @description Return the HierarchyNode corresponding to the ProvenanceNode.
   */
  function findHierarchyNodeFromProvenanceNode(hierarchyNode, currentNode) {
      var currentHierarchyNode;
      hierarchyNode.each(function (node) {
          if (node.data.wrappedNodes.includes(currentNode)) {
              currentHierarchyNode = node;
          }
      });
      if (currentHierarchyNode === undefined) {
          throw new Error("Cannot find current selected node in tree.");
      }
      return currentHierarchyNode;
  }
  function aggregateNodes(aggregation, rootNode, currentNode) {
      // d3.hierarchy wraps nodes recursively and adds some helpers
      // See https://github.com/d3/d3-hierarchy#hierarchy
      var hierarchyRoot = d3.hierarchy(rootNode);
      // the HierarchyNode containing the active ProvenanceTree node
      var currentHierarchyNode = findHierarchyNodeFromProvenanceNode(hierarchyRoot, currentNode);
      var mainBranch = hierarchyRoot
          .path(currentHierarchyNode)
          .map(function (d) { return d.data.wrappedNodes[0].id; });
      // if (this.dataAggregation.arg) {
      aggregation.aggregator.algorithm(currentHierarchyNode.data, rootNode, aggregation.aggregator.tests, mainBranch, aggregation.arg);
      // } else {
      //   this.dataAggregation.algorithm(currentHierarchyNode.data, rootNode, this.dataAggregation.test);
      // }
  }

  function depthSort$1(a, b) {
      if (a.maxDescendantDepth > b.maxDescendantDepth) {
          return -1;
      }
      else if (a.maxDescendantDepth < b.maxDescendantDepth) {
          return 1;
      }
      return 0;
  }
  function GratzlLayoutOld() {
      var dx = 5;
      var dy = 50;
      var widths = [];
      function setTreeX(node, val) {
          node.xOffset = val;
          widths[node.depth] = val;
          if (node.children) {
              node
                  .leaves()
                  .sort(depthSort$1)
                  .forEach(function (leaf) {
                  if (typeof leaf.xOffset === "undefined") {
                      var width = Math.max.apply(null, widths.slice(node.depth, leaf.depth + 1));
                      setTreeX(leaf, val > width ? val : width + 1);
                  }
              });
          }
          if (node.parent && typeof node.parent.xOffset === "undefined") {
              setTreeX(node.parent, val);
          }
      }
      var tree = Object.assign(function (_root, _activeNode) {
          /*
           * set maxDescendantDepth on each node,
           * which is the depth of its deepest child
           *
           * */
          var root = _root;
          var activeNode = _activeNode;
          root.leaves().forEach(function (leaf) {
              leaf.ancestors().forEach(function (leafAncestor) {
                  if (!leafAncestor.maxDescendantDepth ||
                      leaf.depth > leafAncestor.maxDescendantDepth) {
                      leafAncestor.maxDescendantDepth = leaf.depth;
                  }
              });
          });
          /* rendering should start at the deepest leaf of activeNode. */
          var deepestLeaf = activeNode;
          activeNode.leaves().forEach(function (leaf) {
              if (deepestLeaf.depth < leaf.depth) {
                  deepestLeaf = leaf;
              }
          });
          setTreeX(deepestLeaf, 0);
          var maxX = Math.max.apply(null, widths);
          var maxY = Math.max.apply(null, root.leaves().map(function (leaf) { return leaf.depth; }));
          root.each(function (node) {
              sizeNode(node, maxX, maxY);
          });
          return root;
      }, {
          size: (function (x) {
              return x ? ((dx = +x[0]), (dy = +x[1]), tree) : [dx, dy];
          })
      });
      function sizeNode(node, maxX, maxY) {
          node.x = maxX === 0 ? dx : dx - (dx / maxX) * node.xOffset;
          node.y = maxY === 0 ? dy : (dy / maxY) * node.depth;
      }
      return tree;
  }

  function caterpillar(updateNodes, treeNodes, updatedLinks, provenanceTreeVisualization) {
      if (provenanceTreeVisualization.caterpillarActivated) {
          var mainNodes = updateNodes.filter(function (d) { return d.x === 0; });
          var mainNodesData_1 = mainNodes
              .data()
              .map(function (d) { return d.data.wrappedNodes[0].id; });
          // console.log(mainNodesData);
          var edgeNodes = mainNodes.filter(function (d) {
              if (d.children) {
                  return d.children.length > 1;
              }
              return false;
          });
          edgeNodes.select("circle").attr("class", "intent_wrapped");
          edgeNodes.select("rect").attr("class", "intent_wrapped");
          // Hide the rest of the circles and links
          updateNodes.filter(function (d) { return d.x !== 0; }).attr("class", "node hiddenClass");
          updatedLinks
              .filter(function (d) { return d.target.x !== 0; })
              .attr("class", "node hiddenClass");
          // Set the label which indicate the number of nodes wrapped
          updateNodes
              .select("text.circle-text")
              .filter(function (d) { return d.x !== 0; })
              .attr("visibility", "hidden");
          edgeNodes
              .select(".normal>text.circle-text")
              .attr("visibility", "visible")
              .text(function (d) {
              var copyNode = d.copy();
              copyNode.children = copyNode.children.filter(function (e, i, arr) {
                  return !mainNodesData_1.includes(e.data.wrappedNodes[0].id);
              });
              return copyNode.descendants().length;
          })
              .attr("x", function (d) {
              var copyNode = d.copy();
              copyNode.children = copyNode.children.filter(function (e, i, arr) {
                  return !mainNodesData_1.includes(e.data.wrappedNodes[0].id);
              });
              if (copyNode.descendants().length < 10) {
                  return -1.5;
              }
              else {
                  return -3;
              }
          });
          // Set the radius of the circle
          edgeNodes.select("circle").attr("r", function (d) {
              return Math.min(4 + 0.15 * d.descendants().length, 6);
          });
          // Set the click function
          edgeNodes.on("click", function (d) {
              var actualCatGraph = d3.selectAll(".classCat");
              // When click again -> auxiliar tree disappearss.
              if (actualCatGraph
                  .data()
                  .map(function (k) { return k.data.wrappedNodes[0].id; })
                  .includes(d.data.wrappedNodes[0].id)) {
                  actualCatGraph
                      .data([])
                      .exit()
                      .remove();
                  d3.selectAll("path.linkCat")
                      .data([])
                      .exit()
                      .remove();
                  // console.log(
                  //   actualCatGraph.data().map((k: any) => k.data.wrappedNodes[0].id)
                  // );
                  // console.log(d.data.wrappedNodes[0].id);
              }
              else {
                  // else -> deploy the new tree.
                  var treeCopy = d.copy();
                  treeCopy.children = treeCopy.children.filter(function (e, i, arr) {
                      return !mainNodesData_1.includes(e.data.wrappedNodes[0].id);
                  });
                  var treeLayoutCat = GratzlLayoutOld().size([35, 120]);
                  var treeCat = treeLayoutCat(treeCopy, treeCopy);
                  var excatNodes = provenanceTreeVisualization.g
                      .selectAll("g.classCat")
                      .data(treeCat.descendants(), function (datum) {
                      return datum.data.wrappedNodes.map(function (n) { return n.id; }).join();
                  });
                  excatNodes.exit().remove();
                  var catNodes = excatNodes
                      .enter()
                      .append("g")
                      .attr("class", "classCat node branch-active ")
                      .data(treeNodes)
                      .attr("transform", function (datum) {
                      return datum.data.wrappedNodes[0].metadata.isSlideAdded
                          ? "translate(" + (d.x - 3) + ", " + d.y + ")"
                          : "translate(" + d.x + ", " + d.y + ")";
                  });
                  // .append('g')
                  // .attr('class', 'classCat node branch-active ')
                  // .attr('transform', (k: any) => `translate(${k.x}, ${k.y})`);
                  catNodes.append("circle").attr("r", 3);
                  // Fix the radius of the circles according to #nodes wrapped
                  catNodes.select("circle").attr("r", function (datum) {
                      var radius = 2;
                      if (datum.data.neighbour === true) {
                          radius = 3;
                      }
                      if (datum.data.wrappedNodes.length !== 1) {
                          radius = Math.min(4 + 0.15 * datum.data.wrappedNodes.length, 6);
                      }
                      return radius;
                  });
                  // Assign classes to the circles
                  catNodes.select("circle").attr("class", function (datum) {
                      var classString = "";
                      if (isKeyNode(datum.data.wrappedNodes[0])) {
                          classString += " keynode";
                      }
                      classString += " intent_" + getNodeIntent(d.data.wrappedNodes[0]);
                      return classString;
                  });
                  catNodes.on("click", function (datum) {
                      return provenanceTreeVisualization.traverser.toStateNode(datum.data.wrappedNodes[0].id, 250);
                  });
                  // Set the #nodes-wrapped label
                  catNodes
                      .append("text")
                      .attr("class", "circle-text")
                      .attr("visibility", function (datum) {
                      if (datum.data.wrappedNodes.length === 1) {
                          return "hidden";
                      }
                      else {
                          return "visible";
                      }
                  })
                      .attr("x", function (datum) {
                      if (datum.data.wrappedNodes.length >= 10) {
                          return -3;
                      }
                      return -1.5;
                  })
                      .attr("y", 2)
                      .text(function (datum) { return datum.data.wrappedNodes.length.toString(); });
                  // Set the links between circles
                  var oldLinksCat = provenanceTreeVisualization.g
                      .selectAll("path.linkCat")
                      .data(treeCat.links(), function (datum) {
                      return datum.target.data.wrappedNodes.map(function (n) { return n.id; }).join();
                  });
                  oldLinksCat.exit().remove();
                  var newLinksCat = oldLinksCat
                      .enter()
                      .insert("path", "g")
                      .attr("d", provenanceTreeVisualization.linkPath);
                  oldLinksCat
                      .merge(newLinksCat)
                      .attr("class", "link linkCat")
                      .filter(function (datum) { return datum.target.x === 0; })
                      .attr("class", "link active linkCat");
              } // end else actualgraph
          }); // end on click
      } // if of caterpillar procedure
  }

  var xScale = -20;
  var yScale = 20;
  var treeWidth = 0;
  var maxtreeWidth = 10;
  var fontSize = 8;
  /**
   * @description Class used to create and manage a provenance tree visualization.
   * @param traverser {ProvenanceGraphTraverser} - To manage the data structure of the graph.
   * @param svg {D3SVGSelection} - To manage the graphics of the tree.
   * @param _dataAggregation {aggregator<ProvenanceNode>} - Data aggregation in use.
   * @param caterpillarActivated {boolean} - True if this feature is enable.
   */
  var ProvenanceTreeVisualization = /** @class */ (function () {
      function ProvenanceTreeVisualization(traverser, elm, aggreg) {
          var _this = this;
          this.aggregation = {
              aggregator: rawData,
              arg: 1
          };
          this.caterpillarActivated = false;
          this.zoom = 1;
          this.brushPos = { x: 10, y: 10 };
          this.traverser = traverser;
          this.colorScheme = d3.scaleOrdinal(d3.schemeAccent);
          this.container = d3.select(elm)
              .append('div')
              .attr('class', 'visualizationContainer')
              .attr('style', 'height:' + ("" + (window.innerHeight - 178)) + 'px');
          if (aggreg == "ProvGraph") {
              this.aggregation.aggregator = rawData;
          }
          else if (aggreg == "PlotTrimmerG") {
              this.aggregation.aggregator = plotTrimmerG;
          }
          else if (aggreg == "PlotTrimmerC") {
              this.aggregation.aggregator = plotTrimmerC;
          }
          // Append svg element
          this.svg = this.container
              .append('div')
              .attr('style', ' width: 95%; margin-left:5px;flex: 4')
              .append('svg')
              .attr('style', "overflow: visible; width: 100%; height: 100%; font-size: " + fontSize + "px; line-height: " + fontSize + "px");
          this.g = this.svg.append('g');
          // Append grouping buttons
          addAggregationButtons(this.container, this);
          traverser.graph.on('currentChanged', function () {
              _this.update();
          });
          traverser.graph.on('nodeChanged', function () {
              _this.update();
          });
          // traverser.graph.on('nodeAdded', () => {
          // });
          this.update();
          this.zoomer = d3.zoom().scaleExtent([0.01, 2]).on('zoom', function () { return _this.zoomed(); });
          this.svg.call(this.zoomer);
          this.setView([this.svg.node().clientWidth / 2, this.brushPos.y], 2 / this.zoom);
      }
      ProvenanceTreeVisualization.prototype.zoomed = function () {
          this.g.attr('transform', d3.event.transform);
      };
      ProvenanceTreeVisualization.prototype.updateZoomExtent = function (extent) {
          this.zoomer.scaleExtent(extent);
      };
      ProvenanceTreeVisualization.prototype.setView = function (t, s) {
          var x = t[0], y = t[1];
          var transform = d3.zoomIdentity.translate(x, y).scale(s);
          if (this.zoomer) {
              this.svg
                  .call(this.zoomer.transform, transform)
                  .call(this.zoomer);
          }
      };
      ProvenanceTreeVisualization.prototype.linkPath = function (_a) {
          var source = _a.source, target = _a.target;
          var _b = [source, target], s = _b[0], t = _b[1];
          // tslint:disable-next-line
          return "M" + s.x * xScale + "," + s.y * yScale + "\n              C" + s.x * xScale + ",  " + (s.y * yScale + t.y * yScale) / 2 + " " + t.x *
              xScale + ",  " + (s.y * yScale + t.y * yScale) / 2 + " " + t.x * xScale + ",  " + t.y *
              yScale;
      };
      /**
       * @descriptionWrap text labels
       */
      ProvenanceTreeVisualization.prototype.wrap = function (text, width) {
          text.each(function () {
              var words = text
                  .text()
                  .split(/(?=[A-Z])/)
                  .reverse();
              var word, line = [], lineNumber = 0;
              var lineHeight = 1.0, // ems
              y = text.attr('y'), dy = 0;
              var tspan = text
                  .text(null)
                  .append('tspan')
                  .attr('x', 7)
                  .attr('y', y)
                  .attr('dy', dy + 'em');
              while ((word = words.pop())) {
                  line.push(word);
                  tspan.text(line.join(' '));
                  if (tspan.node().getComputedTextLength() > width) {
                      line.pop();
                      tspan.text(line.join(' '));
                      line = [word];
                      tspan = text
                          .append('tspan')
                          .attr('x', 7)
                          .attr('y', y)
                          .attr('dy', ++lineNumber * lineHeight + dy + 'em')
                          .text(word);
                  }
              }
          });
      };
      ProvenanceTreeVisualization.prototype.setTraverser = function (traverser) {
          this.traverser = traverser;
      };
      /**
       * @description Update the tree layout.
       */
      ProvenanceTreeVisualization.prototype.update = function () {
          var _this = this;
          var wrappedRoot = wrapNode(this.traverser.graph.root);
          aggregateNodes(this.aggregation, wrappedRoot, this.traverser.graph.current);
          var hierarchyRoot = d3.hierarchy(wrappedRoot); // Updated de treeRoot
          var currentHierarchyNode = findHierarchyNodeFromProvenanceNode(hierarchyRoot, this.traverser.graph.current);
          var tree = GratzlLayout(hierarchyRoot, currentHierarchyNode);
          this.hierarchyRoot = tree;
          var treeNodes = tree.descendants();
          var oldNodes = this.g.selectAll('g.node').data(treeNodes, function (d) {
              var data = d.data.wrappedNodes.map(function (n) { return n.id; }).join();
              return data;
          });
          oldNodes.exit().remove();
          // group wrapping a node
          var newNodes = oldNodes
              .enter()
              .append('g')
              .attr('class', 'node')
              .attr('transform', function (d) { return "translate(" + d.x * xScale + ", " + d.y * yScale + ")"; });
          // node label
          newNodes
              .append('text')
              .attr('class', 'circle-label')
              .text(function (d) { return groupNodeLabel(d.data); }) // .text(d => d.data.neighbour.toString())
              .attr('x', 7)
              .attr('alignment-baseline', 'central');
          // .call(this.wrap, 70);
          var updateNodes = newNodes.merge(oldNodes);
          updateNodes.selectAll('g.normal').remove();
          updateNodes.selectAll('g.bookmarked').remove();
          updateNodes.selectAll('.circle-text').remove();
          var getNodeSize = function (node) {
              return Math.min(2.7 + 0.3 * node.wrappedNodes.length, 7);
          };
          // other nodes to circle
          updateNodes
              .filter(function (d) {
              return !d.data.wrappedNodes.some(function (node) { return node.metadata.isSlideAdded; });
          })
              .append('g')
              .attr('class', 'normal');
          updateNodes.on('contextmenu', function (d) {
              d.data.wrappedNodes[0].bookmarked = !d.data.wrappedNodes[0].bookmarked;
              _this.update();
              // this._deckViz.onAdd(d.data.wrappedNodes[0]);
          });
          updateNodes
              .select('g')
              .append('circle')
              .attr('class', function (d) {
              var classString = '';
              // console.log(d.data.wrappedNodes[0]);
              if (d.data.wrappedNodes[0].bookmarked === true) {
                  classString += ' bookmarked';
              }
              else if (d.data.wrappedNodes[0].metadata.loaded === true) {
                  classString += ' loaded';
              }
              if (isKeyNode(d.data.wrappedNodes[0])) {
                  classString += ' keynode';
              }
              classString += ' intent_' + getNodeIntent(d.data.wrappedNodes[0]);
              return classString;
          })
              .attr('r', function (d) { return getNodeSize(d.data); });
          // hide labels not in branch
          updateNodes
              .select('text.circle-label')
              .attr('visibility', function (d) { return (d.x === 0 ? 'visible' : 'hidden'); });
          updateNodes.on('click', function (d) {
              _this.traverser.toStateNode(d.data.wrappedNodes[0].id, 250);
              _this.update();
          });
          // set classes on node
          updateNodes
              .attr('class', 'node branch-active')
              .filter(function (d) { return d.data.neighbour === true; })
              .attr('class', 'node branch-active neighbour');
          updateNodes
              .filter(function (d) {
              var ref = d.data.wrappedNodes.includes(_this.traverser.graph.current);
              if (ref) {
                  _this.brushPos.x = _this.svg.node().clientWidth / 2;
                  _this.brushPos.y = (d.y * yScale * 2) < _this.svg.node().clientHeight / 4 * 3 ?
                      10 : 10 + (_this.svg.node().clientHeight / 4 * 3) - (d.y * yScale * 2);
              }
              return ref;
          })
              .attr('class', 'node branch-active neighbour node-active');
          updateNodes
              .data(treeNodes)
              .transition()
              .duration(500)
              .attr('transform', function (d) {
              if (d.x > treeWidth && treeWidth <= maxtreeWidth) {
                  var classString = "translate(" + d.x * xScale + ", " + d.y * yScale + ")";
                  treeWidth = d.x;
              }
              else {
                  var classString = "translate(" + d.x * xScale + ", " + d.y * yScale + ")";
              }
              return classString;
          });
          var oldLinks = this.g
              .selectAll('path.link')
              .data(tree.links(), function (d) {
              return d.target.data.wrappedNodes.map(function (n) { return n.id; }).join();
          });
          oldLinks.exit().remove();
          var newLinks = oldLinks
              .enter()
              .insert('path', 'g')
              .attr('d', function (d) { return _this.linkPath(d); });
          oldLinks
              .merge(newLinks)
              .attr('class', 'link')
              .filter(function (d) { return d.target.x === 0; })
              .attr('class', 'link active');
          oldLinks
              .merge(newLinks)
              .transition()
              .duration(500)
              .attr('d', function (d) { return _this.linkPath(d); });
          var updatedLinks = oldLinks.merge(newLinks);
          if (this.caterpillarActivated) {
              caterpillar(updateNodes, treeNodes, updatedLinks, this);
          }
          this.setView([this.brushPos.x, this.brushPos.y], 2 / this.zoom);
      }; // end update
      ProvenanceTreeVisualization.prototype.getTraverser = function () {
          return this.traverser;
      };
      return ProvenanceTreeVisualization;
  }());

  exports.ProvenanceTreeVisualization = ProvenanceTreeVisualization;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=provenance-tree-visualization.umd.js.map
