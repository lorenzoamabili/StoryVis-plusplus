import * as d3 from 'd3';
import { HierarchyPointNode } from 'd3';
import {
  ProvenanceGraphTraverser,
  ProvenanceNode,
  StateNode
} from '@visualstorytelling/provenance-core';

import gratzl from './gratzl';
import { IHierarchyPointNodeWithMaxDepth } from './gratzl';
import { IGroupedTreeNode } from './utils';
import { NodeAggregator } from './aggregation/aggregation-implementations';
import { provGraphControls } from './controls';

import {
  getNodeIntent,
  groupNodeLabel,
  isKeyNode,
  rawData,
  wrapNode,
  plotTrimmerC,
  defaultData,
  plotTrimmerG,
  grouping,
  pruning,
  compression,
  plotTrimmer,
  filter,
  testUserIntent,
  testNeighbours,
  getNodeRenderer,
  bookmarker
} from './aggregation/aggregation-objects';
import {
  addAggregationButtons
} from './components';
import {
  aggregateNodes,
  filterNodes,
  findHierarchyNodeFromProvenanceNode
} from './aggregation/aggregation';
import { caterpillar } from './caterpillar';
import {
  NodeFilter, derivation, exploration, selection, configuration, annotation, provenance,
  filterTreeNodes
} from './filtering';
import { ProvenanceMinimap } from './minimap';

var treeWidth = 0;
const fontSize = 8;

export type D3SVGSelection = d3.Selection<SVGSVGElement, any, null, undefined>;
export type D3SVGGSelection = d3.Selection<SVGGElement, any, null, undefined>;
export type D3DIVSelection = d3.Selection<HTMLDivElement, any, null, undefined>;

export interface IAggregation {
  aggregator: NodeAggregator<ProvenanceNode>;
  arg: any;
}

/**
 * @description Class used to create and manage a provenance tree visualization.
 * @param traverser {ProvenanceGraphTraverser} - To manage the data structure of the graph.
 * @param svg {D3SVGSelection} - To manage the graphics of the tree.
 * @param _dataAggregation {aggregator<ProvenanceNode>} - Data aggregation in use.
 * @param caterpillarActivated {boolean} - True if this feature is enable.
 * @param elasticTreeLayoutActivated {boolean} - True if this feature is enable.
 *  */
export class ProvenanceTreeVisualization {
  public traverser: ProvenanceGraphTraverser;
  public elm: HTMLDivElement;
  public colorScheme: any;
  public g: D3SVGGSelection;
  public svg: D3SVGSelection;
  public container: any;
  public minimap: ProvenanceMinimap;
  public minimapFixed: boolean = false;
  public aggregation: IAggregation = {
    aggregator: rawData,
    arg: 1
  };
  public filterAggr: IAggregation = {
    aggregator: filter,
    arg: 1
  };
  public topoFilter: boolean = true;
  public filter: NodeFilter<ProvenanceNode>[] = [derivation, exploration, selection, configuration, annotation, provenance];
  private wasManuallyZoomed: boolean;
  private hierarchyRoot:
    | IHierarchyPointNodeWithMaxDepth<IGroupedTreeNode<ProvenanceNode>>
    | undefined;

  private zoomer: any;
  private zoom = 1;
  // private zoomDone = false;
  private brushPos: { x: number, y: number } = { x: 10, y: 10 };
  private duration: number = 500;

  public caterpillarActivated = false;
  public elasticTreeLayoutActivated = false;
  public storyOrderLayoutActivated = false;

  public maxtreeWidth = this.elasticTreeLayoutActivated ? 20 : 10;
  public xScale = this.elasticTreeLayoutActivated ? -10 : -20;
  public yScale = this.elasticTreeLayoutActivated ? 10 : 20;
  public autoScaling = false;
  private canvasRect: any;
  private targetRect: any;

  public navigateLinearizedGraphDown: boolean = false;
  public navigateLinearizedGraphUp: boolean = false;

  public mergingEnabled: boolean = false;
  public transferringEnabled: boolean = false;
  public copyingEnabled: boolean = false;

  constructor(traverser: ProvenanceGraphTraverser, elm: HTMLDivElement, aggreg: string) {
    this.elm = elm;
    this.traverser = traverser;
    this.colorScheme = d3.scaleOrdinal(d3.schemeAccent);
    this.container = d3.select(elm)
      .append('div')
      .attr('class', 'visualizationContainer');

    if (aggreg === "ProvGraph") {
      this.aggregation.aggregator = rawData;
    }
    else if (aggreg === "PlotTrimmerG") {
      this.aggregation.aggregator = plotTrimmerG;
    }
    else if (aggreg === "PlotTrimmerC") {
      this.aggregation.aggregator = plotTrimmerC;
    }

    // Append svg element
    this.svg = this.container
      .append('svg')
      .attr('style', 'margin-left: 5px; flex: 4; height: 100%; width: 100%; font-size:' + fontSize + 'px; line-height:' + fontSize + 'px;');

    this.g = this.svg.append('g');

    // Append grouping buttons
    addAggregationButtons(this.container, this);

    traverser.graph.on('currentChanged', () => {
      this.update();
    });

    traverser.graph.on('nodeChanged', () => {
      this.update();
    });

    traverser.graph.on('nodeAdded', () => {
      if (this.autoScaling && !this.caterpillarActivated) {
        this.scaleToFit();
      }
    });

    //   this.update();
    //   this.zoomer = d3.zoom().scaleExtent([0.01, 2]).on('zoom', () => this.zoomed());
    //   this.svg.call(this.zoomer);
    //   this.setView([this.svg.node()!.clientWidth / 2, this.brushPos.y], 2 / this.zoom);
    // }

    // private zoomed(): void {
    //   this.g.attr('transform', (d3 as any).event.transform);
    //   this.zoomDone = true;
    // }

    // public updateZoomExtent(extent: [number, number]) {
    //   this.zoomer.scaleExtent(extent);
    // }

    this.minimap = new ProvenanceMinimap(this, this.elm, 1 / 2);

    provGraphControls(this);

    this.wasManuallyZoomed = false;

    // this.zoomer = d3.zoom();
    // this.setZoomExtent();
    this.zoomer = d3.zoom().scaleExtent([1, 3]).on('zoom', () => this.zoomed());

    this.svg.call(this.zoomer);
    this.scaleToFit();
    this.update();
  }

  public setView(t: [number, number], s: number, smoothing: number = 0): void {
    const [x, y] = t;
    const transform = d3.zoomIdentity.translate(x, y).scale(s);
    this.wasManuallyZoomed = true;
    if (this.zoomer) {
      this.svg
        .call(this.zoomer.transform, transform)
        .call(this.zoomer);
    }
    // this.zoomDone = false;
  }

  public updateZoomExtent(extent: [number, number]) {
    this.zoomer.scaleExtent(extent);
  }

  private zoomed(): void {
    const transform = (d3 as any).event.transform;

    transform.x = Math.min(300, transform.x);
    transform.x = Math.max(50, transform.x);
    // transform.y = Math.min(850, transform.y);
    // transform.y = Math.max(0, transform.y);
    this.g.attr("transform", transform.toString());


    if (!this.wasManuallyZoomed) {
      const scale = transform.k;
      const translate = [-transform.x, -transform.y] as [number, number];

      this.minimap.setView(translate, 1 / scale);
    }
    this.wasManuallyZoomed = false;
  }


  public scaleToFit() {
    const sizeX = this.elm.clientWidth;
    const sizeY = this.elm.clientHeight;
    const maxScale = 3;

    var height = this.hierarchyRoot ? this.hierarchyRoot.height * this.yScale : 1;
    var treePaddingX = 15;

    var scaleFactor = Math.min(
      maxScale,
      sizeY / height
    );

    if (scaleFactor === sizeY / height) {
      scaleFactor = Math.max(
        1.5,
        sizeY / height
      );
    }

    const moveGraphOnX = (sizeX / 5 + treePaddingX * treeWidth);

    this.svg
      .transition()
      .duration(0)
      .call(this.zoomer.transform, () =>
        d3.zoomIdentity.translate(moveGraphOnX, 20).scale(scaleFactor)
      );
  }

  // public scaleToFit(n?: number) {
  //   const sizeX = this.svg.node()!.clientWidth;
  //   const sizeY = this.svg.node()!.clientHeight;
  //   const maxScale = 2.5;
  //   const magicNumY = 0.9; // todo: get relevant number based on dimensions
  //   const magicNumX = 0.4; // todo: get relevant number based on dimensions

  //   var width = (n !== undefined) ? n : 0;
  //   var height = this.elasticTreeLayoutActivated ? this.traverser.graph.current.metadata.creationOrder : this.hierarchyRoot ? this.hierarchyRoot.height : 0;
  //   var treePaddingX = 15;

  //   var scaleFactor = Math.min(
  //     maxScale,
  //     (magicNumY * sizeY) / (height * this.yScale),
  //     (magicNumX * sizeX) / (width * -this.xScale)
  //   );

  //   if (scaleFactor === maxScale) {
  //     var moveGraphOnX = sizeX / 2;
  //   } else {
  //     moveGraphOnX = (sizeX + treePaddingX * treeWidth) / 2;
  //   }

  //   this.svg
  //     .transition()
  //     .duration(0)
  //     .call(this.zoomer.transform, () =>
  //       d3.zoomIdentity.translate(moveGraphOnX, 20).scale(scaleFactor)
  //     );
  // }

  public linkPath({
    source,
    target
  }: {
    source: HierarchyPointNode<IGroupedTreeNode<ProvenanceNode>>;
    target: HierarchyPointNode<IGroupedTreeNode<ProvenanceNode>>;
  }, scale?: [number, number]): string {
    const [s, t] = [source, target];
    let [x, y] = [this.xScale, this.yScale];
    if (scale) { [x, y] = scale; }
    return `M${s.x * x},${s.y * y}
            C${s.x * x},  ${(s.y * y + t.y * y) / 2} ${t.x * x},  ${(s.y * y + t.y * y) / 2} ${t.x * x},  ${t.y * y}`;
  }
  /**
   * @descriptionWrap text labels
   */
  public wrap(text: any, width: any) {
    text.each(function () {
      const words = text
        .text()
        .split(/(?=[A-Z])/)
        .reverse();
      let word,
        line = [],
        lineNumber = 0;
      const lineHeight = 1.0, // ems
        y = text.attr('y'),
        dy = 0;
      let tspan = text
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
  }



  /**
   * @description Update the tree layout.
   */
  public update() {
    if ((this.traverser.graph.current as StateNode).metadata.option !== 'copied') {
      const wrappedRoot = wrapNode(this.traverser.graph.root);
      const originalHierarchyRoot = d3.hierarchy(wrappedRoot); // Updated de treeRoot
      const originalCurrentHierarchyNode = findHierarchyNodeFromProvenanceNode(
        originalHierarchyRoot,
        this.traverser.graph.current
      );

      const originalTree = gratzl(originalHierarchyRoot, originalCurrentHierarchyNode);
      const minimapNodes = originalTree.descendants();
      this.minimapFixed = true;

      aggregateNodes(this.aggregation, wrappedRoot, this.traverser.graph.current);
      const hierarchyRoot = d3.hierarchy(wrappedRoot); // Updated de treeRoot
      const currentHierarchyNode = findHierarchyNodeFromProvenanceNode(
        hierarchyRoot,
        this.traverser.graph.current
      );

      this.canvasRect = this.svg.node()!.getBoundingClientRect();
      this.targetRect = this.minimap.svg.node()!.getBoundingClientRect();

      const tree = gratzl(hierarchyRoot, currentHierarchyNode);
      this.hierarchyRoot = tree;

      let treeNodes = tree.descendants();

      const elasticTreeNodes: IHierarchyPointNodeWithMaxDepth<IGroupedTreeNode<ProvenanceNode>>[] = [];
      const storyOrderNodes: IHierarchyPointNodeWithMaxDepth<IGroupedTreeNode<ProvenanceNode>>[] = [];

      this.yScale = this.elasticTreeLayoutActivated ? 10 : 20;
      this.xScale = this.elasticTreeLayoutActivated ? -10 : -20;

      if (this.elasticTreeLayoutActivated) {
        // const rootTime = treeNodes[0].data.wrappedNodes[0].metadata.createdOn;
        for (const node of treeNodes) {
          node.y = node.data.wrappedNodes[0].metadata.creationOrder;
          // node.y = node.data.wrappedNodes[0].metadata.createdOn - rootTime;
          elasticTreeNodes.push(node);
          treeNodes = elasticTreeNodes;
        }
      }


      if (this.storyOrderLayoutActivated) {
        for (const node of treeNodes) {
          // if (node.data.wrappedNodes[0].metadata.story) {
          node.y = node.data.wrappedNodes[0].metadata.creationOrder;
          node.x = node.data.wrappedNodes[0].metadata.slideCreationOrder ? -node.data.wrappedNodes[0].metadata.slideCreationOrder : 0;
          storyOrderNodes.push(node);
          // }
          treeNodes = storyOrderNodes;
        }
      }

      treeNodes = treeNodes.filter((d: any) => d.data.wrappedNodes[0].metadata.option !== 'merged');

      if (this.topoFilter) {
        treeNodes = filterTreeNodes(treeNodes, this.filter);
      } else {
        filterNodes(this.filterAggr, wrappedRoot, this.traverser.graph.current);
        filterTreeNodes(treeNodes, this.filter);
      }

      const oldNodes = this.g.selectAll('g.node').data(treeNodes, (d: any) => {
        const data = d.data.wrappedNodes.map((n: any) => n.id).join();
        return data;
      });

      // const duration = this.aggregation.aggregator.name === 'Raw data' ? this.duration : this.duration * 2;

      oldNodes.exit().remove();


      // group wrapping a node
      const newNodes = oldNodes
        .enter()
        .append('g')
        .attr('class', 'node')
        .attr(
          'transform',
          (d: any) => `translate(${d.x * this.xScale}, ${d.y * this.yScale})`
        );


      // node label
      newNodes
        .append('text')
        .attr('class', 'circle-label')
        .text(d => groupNodeLabel(d.data)) // .text(d => d.data.neighbour.toString())
        .attr('x', 7)
        .attr('alignment-baseline', 'central');
      // .text(function(d: any) { return d.subtitle; })
      // .call(this.make_editable, "subtitle");
      // .call(this.wrap, 70);


      const updateNodes = newNodes.merge(oldNodes as any);

      updateNodes.selectAll('g.normal').remove();
      updateNodes.selectAll('g.bookmarked').remove();
      updateNodes.selectAll('.circle-text').remove();

      const getNodeSize = (node: IGroupedTreeNode<ProvenanceNode>) => {
        return Math.min(2.7 + 0.3 * node.wrappedNodes.length, 7);
      };

      const getNumberOfAggrNodes = (node: IGroupedTreeNode<ProvenanceNode>) => {
        return node.wrappedNodes.length;
      };


      updateNodes.attr('class', 'node');

      // other nodes to circle
      updateNodes
        .filter((d: any) => {
          return !d.data.wrappedNodes.some(
            (node: ProvenanceNode) => node.metadata.isSlideAdded
          );
        })
        .append('g')
        .attr('class', 'normal');


      updateNodes.on('contextmenu', (d: any) => {
        this.traverser.toStateNode(d.data.wrappedNodes[0].id, 250);
        this.update();
        this.traverser.graph.current = this.traverser.graph.getNode(d.data.wrappedNodes[0].id);
        d.data.wrappedNodes[0].metadata.bookmarked = !d.data.wrappedNodes[0].metadata.bookmarked;
        if (!d.data.wrappedNodes[0].metadata.bookmarked) {
          (window as any).slideDeck.onDelete(null, this.traverser.graph.current);
        } else {
          (window as any).slideDeck.onAdd(this.traverser.graph.current);
          // (window as any).canvas.duplicateView();
        }
      });


      // set classes on node
      updateNodes
        .attr('class', 'node')
        .filter((d: any) => {
          if (d.x === 0) {
            d.data.wrappedNodes[0].metadata.mainbranch = true;
          }
          return d.x === 0;
        })
        .attr('class', 'node branch-active')
        .filter((d: any) => {
          let neighbourNode: boolean = false;
          if ((this.traverser.graph.current as any).parent) {
            neighbourNode = (this.traverser.graph.current as any).parent === d.data.wrappedNodes[0] ? true : neighbourNode;
            d.data.wrappedNodes[0].metadata.neighbour = neighbourNode ? true : neighbourNode;
          }
          if ((this.traverser.graph.current as any).children.length !== 0) {
            for (const child of (this.traverser.graph.current as any).children) {
              neighbourNode = d.data.wrappedNodes.includes(child) ? true : neighbourNode;
              d.data.wrappedNodes[0].metadata.neighbour = neighbourNode ? true : neighbourNode;
            }
          }
          return neighbourNode;
        })
        .attr('class', 'node branch-active neighbour');


      updateNodes
        .filter((d: any) => {
          const ref = d.data.wrappedNodes.includes(this.traverser.graph.current);
          if (ref) {
            this.brushPos.x = this.svg.node()!.clientWidth / 2;
            this.brushPos.y = (d.y * this.yScale * 2) < this.svg.node()!.clientHeight / 4 * 3 ?
              10 : 10 + (this.svg.node()!.clientHeight / 4 * 3) - (d.y * this.yScale * 2);
          }
          return ref;
        })
        .attr('class', 'node branch-active neighbour node-active');


      updateNodes
        .select('g')
        .append('circle')
        .attr('class', (d: any) => {
          let classString = '';
          // console.log(d.data.wrappedNodes[0]);
          if (d.data.wrappedNodes[0].metadata.bookmarked === true) {
            classString += ' bookmarked';
          } else if (d.data.wrappedNodes[0].metadata.loaded === true) {
            classString += ' loaded';
          }
          if (isKeyNode(d.data.wrappedNodes[0])) {
            classString += ' keynode';
          }
          classString += ' intent_' + getNodeIntent(d.data.wrappedNodes[0]);
          return classString;
        })
        .attr('r', (d: any) => {
          let nodeSize: number = getNodeSize(d.data);
          if (d.data.wrappedNodes[0].metadata.neighbour === true) {
            nodeSize = getNodeSize(d.data) * 1.15;
          }
          if (d.data.wrappedNodes.includes(this.traverser.graph.current)) {
            nodeSize = getNodeSize(d.data) * 1.3;
          }
          return nodeSize;
        });


        updateNodes
        .select('g')
        .append('text')
        .attr('x', -1)
        .attr('font-size', "5px")
        .attr('opacity', (d: any) => (d.x === 0 ? 1 : 0.3))
        .text((d: any) => getNumberOfAggrNodes(d.data).toString()) // .text(d => d.data.neighbour.toString())
        .attr('alignment-baseline', 'central');

        
      // hide labels not in branch
      updateNodes
        .select('text.circle-label')
        .attr('class', (d: any) => 'circle-label renderer_' + getNodeRenderer(d.data.wrappedNodes[0]))
        .attr('visibility', (d: any) => (d.x === 0 ? 'visible' : 'hidden'));

      // hide labels not in branch
      updateNodes
        .select('text.circle-label')
        .attr('visibility', (d: any) => (d.x === 0 ? 'visible' : 'hidden'));

      if (this.storyOrderLayoutActivated) {
        updateNodes
          .select('text.circle-label')
          .attr('visibility', 'hidden');

        // updateNodes
        //   .filter((d: any) => {
        //     d.data.wrappedNodes[0].metadata.mainbranch = true;
        //     return d;
        //   });
      };

      if (this.navigateLinearizedGraphUp) {
        updateNodes
          .filter((d: any) => {
            if (d.data.wrappedNodes[0].metadata.creationOrder === this.traverser.graph.current.metadata.creationOrder - 1) {
              this.traverser.toStateNode(d.data.wrappedNodes[0].id, 250);
            }
            return d;
          });
        this.navigateLinearizedGraphUp = false;
        this.update();
      };

      if (this.navigateLinearizedGraphDown) {
        updateNodes
          .filter((d: any) => {
            if (d.data.wrappedNodes[0].metadata.creationOrder === this.traverser.graph.current.metadata.creationOrder + 1) {
              this.traverser.toStateNode(d.data.wrappedNodes[0].id, 250);
            }
            return d;
          });
        this.navigateLinearizedGraphDown = false;
        this.update();
      };

      // set classes on node
      // updateNodes
      // .attr('class', 'node branch-active story')
      // .filter((d: any) => d.data.neighbour === true)
      // .attr('class', 'node branch-active neighbour')


      updateNodes.on('click', d => {
        if (this.transferringEnabled) {
          (window as any).canvas.provenance.transferring(d.data.wrappedNodes[0]);
          this.update();
          this.transferringEnabled = false;
          d3.select("#transferring-trigger").attr('class', 'mat-icon-button mat-button-base mat-primary');
        } else if (this.mergingEnabled) {
          let currentNode = this.traverser.graph.current;
          this.traverser.toStateNode(d.data.wrappedNodes[0].id, 250);
          (window as any).canvas.provenance.merging(currentNode, d.data.wrappedNodes[0]);
          this.update();
          this.mergingEnabled = false;
          d3.select("#merging-trigger").attr('class', 'mat-icon-button mat-button-base mat-primary');
        } else if (this.copyingEnabled) {
          (window as any).canvas.provenance.copying(d.data.wrappedNodes[0]);
          this.copyingEnabled = false;
          d3.select("#copying-trigger").attr('class', 'mat-icon-button mat-button-base mat-primary');
        } else {
          this.traverser.toStateNode(d.data.wrappedNodes[0].id, 250);
          this.update();
        }
      });

      // updateNodes
      //   .on('mouseenter', d => {
      //     this.traverser.toStateNode(d.data.wrappedNodes[0].id, 250);
      //     this.update();
      //   });

      // set classes on node


      updateNodes
      .data(treeNodes)
      .transition()
      .duration(500)
      .attr(
        'transform',
        (d: any) => {
          if (treeWidth <= d.x) {
            treeWidth = treeWidth + 1;
            var classString = `translate(${d.x * this.xScale}, ${d.y * this.yScale})`;
            this.scaleToFit();
          } else {
            var classString = `translate(${d.x * this.xScale}, ${d.y * this.yScale})`;
          }
          return classString;
        }
      );


      const oldLinks = this.g
        .selectAll('path.link')
        .data(tree.links()
          .filter((d: any) => d.target.data.wrappedNodes[0].metadata.option !== 'merged'),
          (d: any) => d.target.data.wrappedNodes.map((n: any) => n.id).join()
        );

      oldLinks.exit().remove();

      const newLinks = oldLinks
        .enter()
        .insert('path', 'g')
        .attr('d', (d: any) => this.linkPath(d));

      oldLinks
        .merge(newLinks as any)
        .attr('class', this.elasticTreeLayoutActivated ? 'link crossing' : 'link')
        .filter((d: any) => d.target.x === 0)
        .attr('class', 'link active');


      oldLinks
        .merge(newLinks as any)
        // .transition()
        // .duration(duration)
        .attr('d', (d: any) => this.linkPath(d));


      const updatedLinks = oldLinks.merge(newLinks as any);

      // let filter: any[] = [];
      // this.filter.forEach((d: any) => filter.push(d.name));

      // if (this.topoFilter) {
      //   let nodeTargets: any[] = [];

      //   updatedLinks.filter((d: any) => {
      //     nodeTargets.push(d.target);
      //     let previousNodeX = 0;
      //     let filterActive = false;
      //     for (let i = nodeTargets.length - 1; i > -1; i--) {
      //       filterActive = filter.includes(nodeTargets[i].data.wrappedNodes[0].action.metadata.userIntent) ? false : true;
      //       if (filterActive) {
      //         if (!nodeTargets[i].children) {
      //           nodeTargets[i].data.wrappedNodes[0].metadata.noLink = true;
      //           previousNodeX = nodeTargets[i].x;
      //         } else if (nodeTargets[i].data.wrappedNodes[0].children[0].metadata.noLink === true && previousNodeX === nodeTargets[i].x) {
      //           nodeTargets[i].data.wrappedNodes[0].metadata.noLink = true;
      //           previousNodeX = nodeTargets[i].x;
      //         }
      //       } else {
      //         nodeTargets[i].data.wrappedNodes[0].metadata.noLink = false;
      //       }
      //     }
      //     return d;
      //   });

      //     updatedLinks.filter((d: any) => d.target.data.wrappedNodes[0].metadata.noLink === true).attr('class', 'link hiddenClass');
      // }


      if (this.storyOrderLayoutActivated) {
        updatedLinks.attr("class", "link crossing");
      }

      if (this.caterpillarActivated) {
        caterpillar(updateNodes, treeNodes, updatedLinks, this);
      }

      if (this.minimapFixed) {
        this.minimap.updateNodes(originalTree, minimapNodes);
      } else {
        this.minimap.updateNodes(tree, treeNodes);
      }


      // this.minimap.updateNodes(tree, treeNodes);


      // if (!this.zoomDone) {
      //   this.setView([this.brushPos.x, this.brushPos.y], 2 / this.zoom);
      // }

    } // end update
  }

  public getTraverser(): ProvenanceGraphTraverser {
    return this.traverser;
  }

  public setTraverser(traverser: ProvenanceGraphTraverser): void {
    this.traverser = traverser;
  }

  public createMinimap() {
    return new ProvenanceMinimap(this, this.elm, 1 / 2);
  }

  public free(): void {
    this.container.remove();
    this.minimap.container.remove();
  }

  //   public make_editable(d: any, field: any) {
  //     console.log("make_editable", arguments);
  //     let that =  d3.select('.circle-label');
  //     that.on("mouseover", function () {
  //       that.style("fill", "red");
  //     })
  //       .on("mouseout", function () {
  //         that.style("fill", null);
  //       })
  //       .on("click", function (d: any) {
  //         var p = that.parentNode;
  //         console.log(elm, arguments);

  //         // inject a HTML form to edit the content here...

  //         // bug in the getBBox logic here, but don't know what I've done wrong here;
  //         // anyhow, the coordinates are completely off & wrong. :-((
  //         var xy = elm.getBBox();
  //         var p_xy = p.getBBox();

  //         xy.x -= p_xy.x;
  //         xy.y -= p_xy.y;

  //         var el = d3.select(elm);
  //         var p_el = d3.select(p);

  //         var frm = p_el.append("foreignObject");

  //         var inp = frm
  //           .attr("x", xy.x)
  //           .attr("y", xy.y)
  //           .attr("width", 300)
  //           .attr("height", 25)
  //           .append("xhtml:form")
  //           .append("input")
  //           .attr("value", function () {
  //             // nasty spot to place this call, but here we are sure that the <input> tag is available
  //             // and is handily pointed at by 'this':
  //             this.focus();

  //             return d[field];
  //           })
  //           .attr("style", "width: 294px;")
  //           // make the form go away when you jump out (form looses focus) or hit ENTER:
  //           .on("blur", function () {
  //             console.log("blur", this, arguments);

  //             var txt = (inp as any).node().value;

  //             d[field] = txt;
  //             el
  //               .text(function (d: any) { return d[field]; });

  //             // Note to self: frm.remove() will remove the entire <g> group! Remember the D3 selection logic!
  //             p_el.select("foreignObject").remove();
  //           })
  //           .on("keypress", function () {
  //             console.log("keypress", this, arguments);

  //             // IE fix
  //             if (!(d3 as any).event)
  //               (d3 as any).event = window.event;

  //             var e = (d3 as any).event;
  //             if (e.keyCode == 13) {
  //               if (typeof (e.cancelBubble) !== 'undefined') // IE
  //                 e.cancelBubble = true;
  //               if (e.stopPropagation)
  //                 e.stopPropagation();
  //               e.preventDefault();

  //               var txt = (inp as any).node().value;

  //               d[field] = txt;
  //               el
  //                 .text(function (d: any) { return d[field]; });

  //               // odd. Should work in Safari, but the debugger crashes on this instead.
  //               // Anyway, it SHOULD be here and it doesn't hurt otherwise.
  //               p_el.select("foreignObject").remove();
  //             }
  //           });
  //       });
  //   } 
}