import {
    D3DIVSelection,
    D3SVGGSelection,
    D3SVGSelection,
    ProvenanceTreeVisualization
} from './provenance-tree-visualization';
import * as d3 from 'd3';
import { BrushBehavior } from 'd3-brush';
import { IGroupedTreeNode } from './utils';
import { ProvenanceNode } from '@visualstorytelling/provenance-core';
import { getNodeIntent, isKeyNode } from './aggregation/aggregation-objects';
import { IHierarchyPointNodeWithMaxDepth } from './gratzl';

/**
 * @description Class used to create and manage a minimap for a ProvenanceTreeVisualisation
 * @param treeVis {ProvenanceTreeVisualization} - the visualisation to create a minimap for
 * @param elm {HTMLDivElement} - the html element to render the minimap into
 */
export class ProvenanceMinimap {
    public treeVis: ProvenanceTreeVisualization;
    private hierarchyRoot:
        | IHierarchyPointNodeWithMaxDepth<IGroupedTreeNode<ProvenanceNode>>
        | undefined;

    public container: D3DIVSelection;
    public svg: D3SVGSelection;
    public g: D3SVGGSelection;
    public gBrush: D3SVGGSelection;
    private scaleLabel: any;
    private scaleInput: any;

    private manuallyUpdated = false;
    public followActiveNode = false;

    private canvasRect: any;
    private targetRect: any;

    private brush: BrushBehavior<any>;

    private scale = 1;
    private minScale = 0.01;
    private zoom = 1;

    private nodeScale: { xScale: number, yScale: number } = { xScale: 1, yScale: 1 };


    private brushPos: { x: number, y: number } = { x: 0, y: 0 };

    private tree: any;
    private treeNodes: any;

    constructor(treeVis: ProvenanceTreeVisualization, elm: HTMLDivElement, scale: number) {
        this.treeVis = treeVis;

        this.container = d3
            .select(elm)
            .append('div')
            .attr('class', 'minimapContainer')

        // Append svg element
        this.svg = this.container
            // .append('div')
            // .attr('style', 'height: 85%; width: 95%; margin-left: 5px;')
            .append('svg')
            .attr('style', 'overflow: hidden; width: 100%; height: 100%;');

        const span = this.container
            .append('span');
            
        // Check box setup (label + checkbox)
        // const followLabel = span
        //     .append('label')
        //     .attr('for', 'followActive')
        //     .attr('style', 'text-align: left; padding: 0 10%; font-size: 12px;');

        // const followCheckbox = followLabel
        //     .append('input')
        //     .attr('id', 'followActive')
        //     .attr('type', 'checkbox')
        //     .attr('style', 'vertical-align: middle; padding: 0 10%;')
        //     .on('change', () => { this.followActiveNode = !this.followActiveNode; });

        // followLabel
        //     .append('text').text('Follow active node');

        const scaleLabel = span
            .append('label')
            .attr('for', 'scaleValue')
            .attr('style', 'text-align: left; padding: 0 10%; font-size: 12px;');

        this.scaleInput = scaleLabel
            .append('input')
            .attr('id', 'scaleValue')
            .attr('type', 'range')
            .attr('step', '0.01')
            .attr('min', 0.01)
            .attr('max', 1)
            .attr('style', 'width: 60px; overflow: hidden; vertical-align: middle;')
            .attr('value', scale)
            .on('input', () => {
                this.updateScale(this.scaleInput.property('value'));
            })
            .on('change', () => {
                this.updateScale(this.scaleInput.property('value'));
                this.updateNodes(this.tree, this.treeNodes);
            });

        // this.scaleLabel = scaleLabel
        //     .append('text').text(` Scale: ${this.scale}`);

        this.g = this.svg
            .append('g')
            .attr('transform', `translate(0,0) scale(1)`);

        this.canvasRect = null;
        this.targetRect = null;

        this.updateScale(scale);

        this.brush = d3.brush().extent([[0, 0], [0, 0]])
            .on('brush', () => {
                this.updateProvenanceView();
            });

        this.gBrush = this.g
            .append('g')
            .attr('class', 'brush')
            .call(this.brush);
    }


    private updateScale(scale: number): void {
        if (scale < this.minScale) { return; }
        this.scale = scale;
        this.nodeScale = { xScale: this.treeVis.xScale * this.scale, yScale: this.treeVis.yScale * this.scale };
        this.scaleInput.property('value', this.scale);
        // this.scaleLabel.text('Scale: ' + (+this.scale).toFixed(2)); // Must use type-coertion here
    }

    /**
     * @description updates the position and extent of the brush in the canvas
     */
    public updateBrush(): void {
        if (!this.canvasRect || !this.targetRect) { return; }

        const canvas = this.canvasRect;

        // target canvas is scaled in proportion to the ratio between the height and width of each canvas.
        const brushRect = [this.targetRect.width * this.scale, this.targetRect.height * this.scale];

        // margin: half the size of the brush on both axes.
        const brushMargin = [brushRect[0] / 2, brushRect[1] / 2];

        // extent: canvas size extended by the margin.
        const [ex0, ey0] = [-canvas.width / 2 - brushMargin[0], -brushMargin[1]];
        const [ex1, ey1] = [canvas.width / 2 + brushMargin[0], canvas.height + brushMargin[1]];

        // brush positioning: the brush origin is placed in the center of the brush.
        let [x0, y0] = [-brushRect[0] / 2, -brushRect[1] / 2];
        let [x1, y1] = [brushRect[0] / 2, brushRect[1] / 2];

        if (this.followActiveNode) {
            [x0, y0] = [x0 + this.brushPos.x, y0 + this.brushPos.y];
            [x1, y1] = [x1 + this.brushPos.x, y1 + this.brushPos.y];
        }

        this.brush.extent([[ex0, ey0], [ex1, ey1]]);
        this.gBrush
            .call(this.brush);

        if (this.followActiveNode) {
            this.gBrush
                .transition()
                .duration(200)
                .call(this.brush.move, [
                    [x0 * this.zoom, y0 * this.zoom],
                    [x1 * this.zoom, y1 * this.zoom]
                ]);
        }

        this.gBrush.selectAll('.handle').remove();
        this.gBrush.selectAll('.overlay').remove();
    }

    /**
     * @description updates the transform attribute of the canvas
     */
    private updateTransform(): void {
        if (this.canvasRect != null) {
            const rect = this.canvasRect;
            const x = rect.width / 2 + rect.width / 3;
            const y = 10;
            this.g.attr('transform', `translate(${x}, ${y}) scale(1)`);
        }
    }

    /**
     * @description update and render the nodes visible in the minimap
     * @param tree
     * @param nodes
     */
    public updateNodes(tree: IHierarchyPointNodeWithMaxDepth<IGroupedTreeNode<ProvenanceNode>>,
        nodes: IHierarchyPointNodeWithMaxDepth<IGroupedTreeNode<ProvenanceNode>>[]): void {
        this.tree = tree;
        this.treeNodes = nodes;
        this.hierarchyRoot = tree;
        const oldNodes = this.g.selectAll('g.node').data(nodes, (d: any) => {
            return d.data.wrappedNodes.map((n: any) => n.id).join();
        });
        this.canvasRect = this.svg.node()!.getBoundingClientRect();
        this.targetRect = this.treeVis.svg.node()!.getBoundingClientRect();

        oldNodes.exit().remove();
        // group wrapping a node
        const newNodes = oldNodes
            .enter()
            .insert('g', ':first-child')
            .attr('class', 'node')
            .attr(
                'transform',
                (d: any) => `translate(${d.x * this.nodeScale.xScale}, ${d.y * this.nodeScale.yScale})`
            );

        const updateNodes = newNodes.merge(oldNodes as any);

        updateNodes.selectAll('g.normal').remove();
        updateNodes.selectAll('g.bookmarked').remove();
        updateNodes.selectAll('.circle-text').remove();

        const getNodeSize = (node: IGroupedTreeNode<ProvenanceNode>) => {
            return Math.min(2.7 + 0.3 * node.wrappedNodes.length, 7) * (this.scale) + 0.7;
        };

        updateNodes
            .filter((d: any) => {
                return !d.data.wrappedNodes.some(
                    (node: ProvenanceNode) => node.metadata.isSlideAdded
                );
            })
            .append('g')
            .attr('class', 'normal')
            .attr('pointer-events', 'none');

        updateNodes
            .select('g')
            .append('circle')
            .attr('class', (d: any) => {
                let classString = '';
                if (isKeyNode(d.data.wrappedNodes[0])) {
                    classString += ' keynode';
                }
                classString += ' intent_' + getNodeIntent(d.data.wrappedNodes[0]);

                return classString;
            })
            .attr('r', (d: any) => getNodeSize(d.data));

        // set classes on node
        updateNodes
            .attr('class', 'node branch-active')
            .filter((d: any) => d.data.neighbour)
            .attr('class', 'node branch-active neighbour');

        // set node-active class if node contains current provenance node
        updateNodes
            .filter((d: any) => {
                // const yDiff = this.canvasRect.height - d.y * this.nodeScale.yScale;
                // const xDiff = (this.canvasRect.width - this.canvasRect.width / 4) + d.x * this.nodeScale.xScale;

                // if (yDiff !== 0 && xDiff !== 0 && (yDiff <= 10 || xDiff <= 10)) {
                //     this.updateScale(this.scale * 0.9);
                //     this.updateNodes(tree, nodes);
                // }

                const ref = d.data.wrappedNodes.includes(this.treeVis.traverser.graph.current);
                if (ref && this.followActiveNode) {
                    this.brushPos.x = d.x * this.nodeScale.xScale / this.zoom;
                    this.brushPos.y = d.y * this.nodeScale.yScale / this.zoom;
                }
                return ref;
            })
            .attr('class', 'node branch-active neighbour node-active');

        updateNodes
            .data(nodes)
            .transition()
            .duration(500)
            .attr(
                'transform',
                (d: any) => `translate(${d.x * this.nodeScale.xScale}, ${d.y * this.nodeScale.yScale})`
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
            .attr('d', (d: any) => this.treeVis.linkPath(d, [this.nodeScale.xScale, this.nodeScale.yScale]));

        oldLinks
            .merge(newLinks as any)
            .attr('class', 'link')
            .filter((d: any) => d.target.x === 0)
            .attr('class', 'link active');

        oldLinks
            .merge(newLinks as any)
            .transition()
            .duration(500)
            .attr('d', (d: any) => this.treeVis.linkPath(d, [this.nodeScale.xScale, this.nodeScale.yScale]));

        oldLinks
            .merge(newLinks as any)
            .attr('class', this.treeVis.elasticTreeLayoutActivated ? 'link crossing' : 'link')
            .filter((d: any) => d.target.x === 0)
            .attr('class', 'link active');


        const updatedLinks = oldLinks.merge(newLinks as any);

        if (!this.treeVis.minimapFixed) {
            let nodeTargets: any[] = [];

            updatedLinks.filter((d: any) => {
                nodeTargets.push(d.target);
                let previousNodeX = 0;
                let filterActive = false;
                for (let i = nodeTargets.length - 1; i > -1; i--) {
                    filterActive = this.treeVis.filter.filter((d: any) => d.name === nodeTargets[i].data.wrappedNodes[0].action.metadata.userIntent).length !== 0 ? false : true;
                    if (filterActive) {
                        if (!nodeTargets[i].children) {
                            nodeTargets[i].data.wrappedNodes[0].metadata.noLink = true;
                        } else {
                            if (nodeTargets[i].data.wrappedNodes[0].children[0].metadata.noLink === false && previousNodeX === nodeTargets[i].x) {
                                nodeTargets[i].data.wrappedNodes[0].metadata.noLink = false;
                            } else if (nodeTargets[i].data.wrappedNodes[0].children[0].metadata.noLink === true && previousNodeX === nodeTargets[i].x) {
                                nodeTargets[i].data.wrappedNodes[0].metadata.noLink = true;
                            }
                        }
                        previousNodeX = nodeTargets[i].x;
                    } else {
                        nodeTargets[i].data.wrappedNodes[0].metadata.noLink = false;
                    }
                }
                return d === d;
            });

            let filterComplete = ['derivation', 'exploration', 'selection', 'configuration', 'annotation', 'provenance'];
            if (this.treeVis.filter.length !== filterComplete.length) {
                updatedLinks.filter((d: any) => d.target.data.wrappedNodes[0].metadata.noLink === true).attr('class', 'link hiddenClass');
            }
        }

        this.updateBrush();
        this.updateTransform();
    }

    /**
     * @description updates the view of the canvas in the ProvenanceTreeVisualisation
     */
    private updateProvenanceView(): void {
        // base case to prevent infinite recursion
        if (!(d3 as any).event.selection || this.manuallyUpdated) { return; }

        const rect = (d3 as any).event.selection;
        const [x, y] = [(-rect[0][0] / this.scale) / this.zoom, (-rect[0][1] / this.scale) / this.zoom];

        this.treeVis.setView([x, y], 1 / this.zoom);
    }

    /**
     * @description sets the view for the minimap (the grey rectangle)
     * @param t {[number, number]} - translation in x and y
     * @param s {number} - scale factor
     */
    public setView(t: [number, number], s: number): void {
        this.manuallyUpdated = true;
        const brushRect = this.targetRect ? [this.targetRect.width * this.scale, this.targetRect.height * this.scale] : [0,0];
        const [t0, t1] = [t[0] * this.scale, t[1] * this.scale];
        const [x0, y0] = [t0, t1];
        const [x1, y1] = [t0 + brushRect[0], t1 + brushRect[1]];

        this.gBrush
            .call(this.brush.move, [[x0 * s, y0 * s], [x1 * s, y1 * s]]);

        this.zoom = s;

        this.manuallyUpdated = false;
    }
}
