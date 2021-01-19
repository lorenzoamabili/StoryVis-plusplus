import * as d3 from 'd3';
import { HierarchyPointNode } from 'd3';
import {
  ProvenanceGraphTraverser,
  ProvenanceNode
} from '@visualstorytelling/provenance-core';

import gratzl from './gratzl';
import { IHierarchyPointNodeWithMaxDepth } from './gratzl';
import { IGroupedTreeNode } from './utils';
import { NodeAggregator, transferAll } from './aggregation/aggregation-implementations';

import {
  getNodeIntent,
  groupNodeLabel,
  isKeyNode,
  rawData,
  wrapNode,
  plotTrimmerC,
  plotTrimmerG
} from './aggregation/aggregation-objects';
import {
  addAggregationButtons
} from './components';
import {
  aggregateNodes,
  findHierarchyNodeFromProvenanceNode
} from './aggregation/aggregation';
import { caterpillar } from './caterpillar';

var xScale = -20;
var yScale = 20;
var treeWidth = 0;
var maxtreeWidth = 10;
var p = 3;
const fontSize = 8;

export type D3SVGSelection = d3.Selection<SVGSVGElement, any, null, undefined>;
export type D3SVGGSelection = d3.Selection<SVGGElement, any, null, undefined>;

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
 */
export class ProvenanceTreeVisualization {
  public traverser: ProvenanceGraphTraverser;
  public colorScheme: any;
  public g: D3SVGGSelection;
  public svg: D3SVGSelection;
  public container: any;
  public aggregation: IAggregation = {
    aggregator: rawData,
    arg: 1
  };
  public caterpillarActivated = false;
  private hierarchyRoot:
    | IHierarchyPointNodeWithMaxDepth<IGroupedTreeNode<ProvenanceNode>>
    | undefined;

  private zoomer: any;
  private zoom = 1;
  private zoomDone = false;
  private brushPos: { x: number, y: number } = { x: 10, y: 10 };

  public mergingEnabled: boolean = false;
  public transferringEnabled: boolean = false;
  public copyingEnabled: boolean = false;
  
  constructor(traverser: ProvenanceGraphTraverser, elm: HTMLDivElement, aggreg: string) {
    this.traverser = traverser;
    this.colorScheme = d3.scaleOrdinal(d3.schemeAccent);
    this.container = d3.select(elm)
      .append('div')
      .attr('class', 'visualizationContainer')
      .attr('style', 'height:' + `${window.innerHeight - 178}` + 'px');

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
      .attr(
        'style',
        `overflow: visible; width: 100%; height: 100%; font-size: ${fontSize}px; line-height: ${fontSize}px`
      );

    this.g = this.svg.append('g');

    // Append grouping buttons
    addAggregationButtons(this.container, this);

    traverser.graph.on('currentChanged', () => {
      this.update();
    });

    traverser.graph.on('nodeChanged', () => {
      this.update();
    });

    // traverser.graph.on('nodeAdded', () => {
    // });

    this.update();
    this.zoomer = d3.zoom().scaleExtent([0.01, 2]).on('zoom', () => this.zoomed());
    this.svg.call(this.zoomer);
    this.setView([this.svg.node()!.clientWidth / 2, this.brushPos.y], 2 / this.zoom);
  }

  private zoomed(): void {
    this.g.attr('transform', (d3 as any).event.transform);
    this.zoomDone = true;
  }

  // public updateZoomExtent(extent: [number, number]) {
  //   this.zoomer.scaleExtent(extent);
  // }

  public setView(t: [number, number], s: number): void {
    const [x, y] = t;
    const transform = d3.zoomIdentity.translate(x, y).scale(s);
    if (this.zoomer) {
      this.svg
        .call(this.zoomer.transform, transform)
        .call(this.zoomer);
    }
    this.zoomDone = false;
  }

  public linkPath({
    source,
    target
  }: {
    source: HierarchyPointNode<IGroupedTreeNode<ProvenanceNode>>;
    target: HierarchyPointNode<IGroupedTreeNode<ProvenanceNode>>;
  }): string {
    const [s, t] = [source, target];

    // tslint:disable-next-line
    return `M${s.x * xScale},${s.y * yScale}
              C${s.x * xScale},  ${(s.y * yScale + t.y * yScale) / 2} ${t.x *
      xScale},  ${(s.y * yScale + t.y * yScale) / 2} ${t.x * xScale},  ${t.y *
      yScale}`;
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


  public setTraverser(traverser: ProvenanceGraphTraverser): void {
    this.traverser = traverser;
  }

  public hideTree(): void {
    this.container.attr('class', 'hiddenClass');
  }

  /**
   * @description Update the tree layout.
   */
  public update() {
    const wrappedRoot = wrapNode(this.traverser.graph.root);
    // aggregateNodes(this.aggregation, wrappedRoot, this.traverser.graph.current);
    const hierarchyRoot = d3.hierarchy(wrappedRoot); // Updated de treeRoot
    const currentHierarchyNode = findHierarchyNodeFromProvenanceNode(
      hierarchyRoot,
      this.traverser.graph.current
    );

    const tree = gratzl(hierarchyRoot, currentHierarchyNode);
    this.hierarchyRoot = tree;

    const treeNodes = tree.descendants().filter((d: any) => d.data.wrappedNodes[0].metadata.option !== 'merged');
    const oldNodes = this.g.selectAll('g.node').data(treeNodes, (d: any) => {
      const data = d.data.wrappedNodes.map((n: any) => n.id).join();
      return data;
    });

    oldNodes.exit().remove();
    // group wrapping a node
    const newNodes = oldNodes
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr(
        'transform',
        (d: any) => `translate(${d.x * xScale}, ${d.y * yScale})`
      );

    // node label
    newNodes
      .append('text')
      .attr('class', 'circle-label')
      .text(d => groupNodeLabel(d.data)) // .text(d => d.data.neighbour.toString())
      .attr('x', 7)
      .attr('alignment-baseline', 'central');
    // .call(this.wrap, 70);

    const updateNodes = newNodes.merge(oldNodes as any);

    updateNodes.selectAll('g.normal').remove();
    updateNodes.selectAll('g.bookmarked').remove();
    updateNodes.selectAll('.circle-text').remove();

    const getNodeSize = (node: IGroupedTreeNode<ProvenanceNode>) => {
      return Math.min(2.7 + 0.3 * node.wrappedNodes.length, 7);
    };

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
      d.data.wrappedNodes[0].bookmarked = !d.data.wrappedNodes[0].bookmarked;
      this.update();
      // this._deckViz.onAdd(d.data.wrappedNodes[0]);
    });


    updateNodes
      .select('g')
      .append('circle')
      .attr('class', (d: any) => {
        let classString = '';
        // console.log(d.data.wrappedNodes[0]);
        if (d.data.wrappedNodes[0].bookmarked === true) {
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
      .attr('r', (d: any) => getNodeSize(d.data));

    // hide labels not in branch
    updateNodes
      .select('text.circle-label')
      .attr('visibility', (d: any) => (d.x === 0 ? 'visible' : 'hidden'));


    updateNodes.on('click', d => {
      if (this.transferringEnabled) {
        (window as any).tree.settings.canvas.provenance.transferring(d.data.wrappedNodes[0]);
        this.update();
        this.transferringEnabled = false;
        d3.select("#transferring-trigger").attr('class', 'mat-icon-button mat-button-base mat-primary');
      } else if (this.mergingEnabled) {
        let currentNode = this.traverser.graph.current;
        this.traverser.toStateNode(d.data.wrappedNodes[0].id, 250);
        (window as any).tree.settings.canvas.provenance.merging(currentNode, d.data.wrappedNodes[0]);
        this.update();
        this.mergingEnabled = false;
        d3.select("#merging-trigger").attr('class', 'mat-icon-button mat-button-base mat-primary');
      } else if (this.copyingEnabled) {
        (window as any).tree.settings.canvas.provenance.copying(d.data.wrappedNodes[0]);
        this.copyingEnabled = false;
        d3.select("#copying-trigger").attr('class', 'mat-icon-button mat-button-base mat-primary');
      } else {
        this.traverser.toStateNode(d.data.wrappedNodes[0].id, 250);
        this.update();
      }
    });


    // set classes on node
    updateNodes
      .attr('class', 'node branch-active')
      .filter((d: any) => d.data.neighbour === true)
      .attr('class', 'node branch-active neighbour');


    updateNodes
      .filter((d: any) => {
        const ref = d.data.wrappedNodes.includes(this.traverser.graph.current);
        if (ref) {
          this.brushPos.x = this.svg.node()!.clientWidth / 2;
          this.brushPos.y = (d.y * yScale * 2) < this.svg.node()!.clientHeight / 4 * 3 ?
            10 : 10 + (this.svg.node()!.clientHeight / 4 * 3) - (d.y * yScale * 2);
        }
        return ref;
      })
      .attr('class', 'node branch-active neighbour node-active');

    updateNodes
      .data(treeNodes)
      .transition()
      .duration(500)
      .attr(
        'transform',
        (d: any) => {
          if (d.x > treeWidth && treeWidth <= maxtreeWidth) {
            var classString = `translate(${d.x * xScale}, ${d.y * yScale})`;
            treeWidth = d.x;
            if (treeWidth % p) {
            }
          } else {
            var classString = `translate(${d.x * xScale}, ${d.y * yScale})`;
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
      .attr('class', 'link')
      .filter((d: any) => d.target.x === 0)
      .attr('class', 'link active');

    oldLinks
      .merge(newLinks as any)
      .transition()
      .duration(500)
      .attr('d', (d: any) => this.linkPath(d));

    const updatedLinks = oldLinks.merge(newLinks as any);


    if (this.caterpillarActivated) {
      caterpillar(updateNodes, treeNodes, updatedLinks, this);
    }

    if (!this.zoomDone) {
      this.setView([this.brushPos.x, this.brushPos.y], 2 / this.zoom);
    }
  } // end update

  public getTraverser(): ProvenanceGraphTraverser {
    return this.traverser;
  }
}