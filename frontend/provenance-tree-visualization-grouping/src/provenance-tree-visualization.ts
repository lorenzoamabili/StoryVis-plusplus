import * as d3 from 'd3';
import { HierarchyPointNode } from 'd3';
import {
  ProvenanceGraphTraverser,
  ProvenanceNode
} from '@visualstorytelling/provenance-core';

import gratzl from './gratzl';
import { IGroupedTreeNode } from './utils';
import { NodeAggregator } from './aggregation/aggregation-implementations';

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
  addAggregationButtons,
  setTitle
} from './components';
import {
  aggregateNodes,
  findHierarchyNodeFromProvenanceNode
} from './aggregation/aggregation';
import { caterpillar } from './caterpillar';
import { SlideDeckVisualization } from '../../slide-deck-visualization/src/slide-deck-visualization';

var xScale = -20;
var yScale = 20;
var treeWidth = 0;

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
  public _deckViz: SlideDeckVisualization
  public container: d3.Selection<HTMLDivElement, unknown, null, undefined>;
  public aggregation: IAggregation = {
    aggregator: rawData,
    arg: 1
  };
  // public _aggregator: NodeAggregator<ProvenanceNode> = rawData; // changed from original
  public caterpillarActivated = false;
  private hierarchyRoot:
    | d3.HierarchyPointNode<IGroupedTreeNode<ProvenanceNode>>
    | undefined;
  private zoomer: any;
  public width: number = 0;

  constructor(traverser: ProvenanceGraphTraverser, elm: HTMLDivElement, aggreg: string) {
    this.traverser = traverser;
    this._deckViz = (window as any).slideDeck;
    this.colorScheme = d3.scaleOrdinal(d3.schemeAccent);
    this.container = d3
      .select(elm)
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

    // Add title too root elm
    // setTitle(this.container, () => {
    //   window.alert(
    //     this.aggregation.aggregator.name.toUpperCase() +
    //     ': \n' +
    //     this.aggregation.aggregator.description
    //   );
    // });

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
    addAggregationButtons(this.container, this, aggreg);

    traverser.graph.on('currentChanged', () => {
      this.update();
    });

    traverser.graph.on('nodeChanged', () => {
      this.update();
    });

    traverser.graph.on('nodeAdded', () => {
      this.scaleToFit(this.width);
    });

    this.update();
    this.zoomer = d3.zoom() as any;
    this.setZoomExtent();
    this.svg.call(this.zoomer);
    this.scaleToFit(this.width);
  }

  public setZoomExtent() {
    this.zoomer.scaleExtent([0.1, 2]).on('zoom', () => {
      this.g.attr('transform', d3.event.transform);
    });
    this.scaleToFit();
  }

  public scaleToFit(n?: number) {
    const sizeX = this.svg.node()!.clientWidth;
    const sizeY = this.svg.node()!.clientHeight;
    const maxScale = 2;
    const magicNumY = 0.75; // todo: get relevant number based on dimensions
    const magicNumX = 0.5; // todo: get relevant number based on dimensions

    if (n !== undefined) {
      this.width = n;
      var scaleFactor = Math.min(
        maxScale,
        (magicNumY * sizeY) / (this.hierarchyRoot!.height * yScale),
        (magicNumX * sizeX) / (this.width * -xScale)
      );
    } else {
      var scaleFactor = Math.min(
        maxScale,
        (magicNumY * sizeY) / (this.hierarchyRoot!.height * yScale),
        (magicNumX * sizeX) / (this.width * -xScale)
      );
      return scaleFactor;
    }

    this.svg
      .transition()
      .duration(0)
      .call(this.zoomer.transform, () =>
        d3.zoomIdentity.translate(sizeX / 2, 10).scale(scaleFactor)
      );
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

  /**
   * @description Update the tree layout.
   */
  public update() {
    const wrappedRoot = wrapNode(this.traverser.graph.root);
    aggregateNodes(this.aggregation, wrappedRoot, this.traverser.graph.current);
    const hierarchyRoot = d3.hierarchy(wrappedRoot); // Updated de treeRoot
    const currentHierarchyNode = findHierarchyNodeFromProvenanceNode(
      hierarchyRoot,
      this.traverser.graph.current
    );

    const tree = gratzl(hierarchyRoot, currentHierarchyNode);
    this.hierarchyRoot = tree;

    const treeNodes = tree.descendants();
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
    // newNodes.append('rect')
    //   .attr('width', 40)
    //   .attr('height', 20)
    //   .attr('x', (d: any) => d.x - 20)
    //   .attr('y', (d: any) => -10)
    //   .attr('stroke', 'none')
    //   .attr('fill', (d: any) => d.data.wrappedNodes[0].action ? this.colorScheme(d.data.wrappedNodes[0].action.metadata.taskId) : 'none')
    //   .attr('fill-opacity', 0.8)
    //   .on('mouseover', (d: any) => {
    //     newNodes.append('text')
    //       .attr('class', 'taskName')
    //       .attr('x', (data) => data.x - 30)
    //       .attr('y', (data) => data.y - 5)
    //       .text(d.data.wrappedNodes[0].action.metadata.taskName);
    //   })
    //   .on('mouseout', () => {
    //     d3.select('.taskName').remove();
    //   });

    // node label
    newNodes
      .append('text')
      .attr('class', 'circle-label')
      .text(d => groupNodeLabel(d.data)) // .text(d => d.data.neighbour.toString())
      .attr('x', 7)
      .attr('alignment-baseline', 'central')
      .call(this.wrap, 70);

    const updateNodes = newNodes.merge(oldNodes as any);

    updateNodes.selectAll('g.normal').remove();
    updateNodes.selectAll('g.bookmarked').remove();
    updateNodes.selectAll('.circle-text').remove();


    const getNodeSize = (node: IGroupedTreeNode<ProvenanceNode>) => {
      return Math.min(2.7 + 0.3 * node.wrappedNodes.length, 7);
    };


    // set nodes containing Slides to square
    // updateNodes
    //   .filter((d: any) => {
    //     return d.data.wrappedNodes.some(
    //       (node: ProvenanceNode) => node.metadata.isSlideAdded
    //     );
    //   })
    //   .append('g')
    //   .attr('class', 'bookmarked')
    //   .append('rect')
    //   .attr('fill', (d: any) => {
    //     return d.data.wrappedNodes[0].metadata.bgColor;
    //   })
    //   .attr('width', (d: any) => 2 * getNodeSize(d.data))
    //   .attr('height', (d: any) => 2 * getNodeSize(d.data))
    //   .attr('x', (d: any) => -getNodeSize(d.data))
    //   .attr('y', (d: any) => -getNodeSize(d.data));

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
      this._deckViz.onAdd(d.data.wrappedNodes[0]);
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


    // set node size text in circles / rects
    updateNodes
      .select('g')
      .append('text')
      .attr('class', 'circle-text')
      .attr('text-anchor', 'middle')
      .attr('alignment-baseline', 'central')
      .text((d: any) => d.data.wrappedNodes.length.toString());

    // hide labels not in branch
    updateNodes
      .select('text.circle-label')
      .attr('visibility', (d: any) => (d.x === 0 ? 'visible' : 'hidden'));


    updateNodes.on('click', d => {
      this.traverser.toStateNode(d.data.wrappedNodes[0].id, 250);
      this.update();
    });


    // set classes on node
    updateNodes
      .attr('class', 'node branch-active')
      .filter((d: any) => d.data.neighbour === true)
      .attr('class', 'node branch-active neighbour');

    // set node-active class if node contains current provenance node
    updateNodes
      .filter((d: any) =>
        d.data.wrappedNodes.includes(this.traverser.graph.current)
      )
      .attr('class', 'node branch-active neighbour node-active');

    updateNodes
      .data(treeNodes)
      .transition()
      .duration(500)
      .attr(
        'transform',
        (d: any) => {
          if (d.x > treeWidth) {
            var classString = `translate(${d.x * xScale}, ${d.y * yScale})`;
            treeWidth = d.x;
            this.scaleToFit(d.x);
          } else {
            var classString = `translate(${d.x * xScale}, ${d.y * yScale})`;
          }
          return classString;
        }
      );

    const oldLinks = this.g
      .selectAll('path.link')
      .data(tree.links(), (d: any) =>
        d.target.data.wrappedNodes.map((n: any) => n.id).join()
      );

    oldLinks.exit().remove();

    const newLinks = oldLinks
      .enter()
      .insert('path', 'g')
      .attr('d', this.linkPath);

    oldLinks
      .merge(newLinks as any)
      .attr('class', 'link')
      .filter((d: any) => d.target.x === 0)
      .attr('class', 'link active');

    oldLinks
      .merge(newLinks as any)
      .transition()
      .duration(500)
      .attr('d', this.linkPath);

    const updatedLinks = oldLinks.merge(newLinks as any);

    if (this.caterpillarActivated) {
      caterpillar(updateNodes, treeNodes, updatedLinks, this);
    }

    // Update title
    d3.select('#DataAggregation').text(this.aggregation.aggregator.name);
  } // end update

  public getTraverser(): ProvenanceGraphTraverser {
    return this.traverser;
  }
}

(function () {
  var blockContextMenu;

  blockContextMenu = function (evt: any) {
    evt.preventDefault();
  };

  window.addEventListener('contextmenu', blockContextMenu);
})();