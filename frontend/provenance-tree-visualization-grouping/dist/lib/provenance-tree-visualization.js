"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var d3 = require("d3");
var gratzl_1 = require("./gratzl");
var aggregation_objects_1 = require("./aggregation/aggregation-objects");
var components_1 = require("./components");
var aggregation_1 = require("./aggregation/aggregation");
var caterpillar_1 = require("./caterpillar");
var xScale = -40;
var yScale = 20;
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
            aggregator: aggregation_objects_1.rawData,
            arg: 1
        };
        // public _aggregator: NodeAggregator<ProvenanceNode> = rawData; // changed from original
        this.caterpillarActivated = false;
        this.traverser = traverser;
        this.colorScheme = d3.scaleOrdinal(d3.schemeAccent);
        this.container = d3
            .select(elm)
            .append('div')
            .attr('class', 'visualizationContainer')
            .attr('style', 'height:' + ("" + (window.innerHeight - 178)) + 'px');
        if (aggreg == "ProvGraph") {
            this.aggregation.aggregator = aggregation_objects_1.rawData;
        }
        else if (aggreg == "PlotTrimmerG") {
            this.aggregation.aggregator = aggregation_objects_1.plotTrimmerG;
        }
        else if (aggreg == "PlotTrimmerC") {
            this.aggregation.aggregator = aggregation_objects_1.plotTrimmerC;
        }
        // Add title too root elm
        components_1.setTitle(this.container, function () {
            window.alert(_this.aggregation.aggregator.name.toUpperCase() +
                ': \n' +
                _this.aggregation.aggregator.description);
        });
        // Append svg element
        this.svg = this.container
            .append('div')
            .attr('style', ' width: 95%; margin-left:5px;flex: 4')
            .append('svg')
            .attr('style', "overflow: visible; width: 100%; height: 100%; font-size: " + fontSize + "px; line-height: " + fontSize + "px");
        this.g = this.svg.append('g');
        // Append grouping buttons
        components_1.addAggregationButtons(this.container, this, aggreg);
        traverser.graph.on('currentChanged', function () {
            _this.update();
        });
        traverser.graph.on('nodeChanged', function () {
            _this.update();
        });
        traverser.graph.on('nodeAdded', function () {
            _this.scaleToFit();
        });
        this.update();
        this.zoomer = d3.zoom();
        this.setZoomExtent();
        this.svg.call(this.zoomer);
    }
    ProvenanceTreeVisualization.prototype.setZoomExtent = function () {
        var _this = this;
        this.zoomer.scaleExtent([0.1, 2]).on('zoom', function () {
            _this.g.attr('transform', d3.event.transform);
        });
        this.scaleToFit();
    };
    ProvenanceTreeVisualization.prototype.scaleToFit = function () {
        var sizeX = this.svg.node().clientWidth;
        var sizeY = this.svg.node().clientHeight;
        var maxScale = 2;
        var magicNum = 0.75; // todo: get relevant number based on dimensions
        var scaleFactor = Math.min(maxScale, (magicNum * sizeY) / (this.hierarchyRoot.height * yScale));
        this.svg
            .transition()
            .duration(0)
            .call(this.zoomer.transform, function () {
            return d3.zoomIdentity.translate(sizeX / 2, 10).scale(scaleFactor);
        });
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
        var wrappedRoot = aggregation_objects_1.wrapNode(this.traverser.graph.root);
        aggregation_1.aggregateNodes(this.aggregation, wrappedRoot, this.traverser.graph.current);
        var hierarchyRoot = d3.hierarchy(wrappedRoot); // Updated de treeRoot
        var currentHierarchyNode = aggregation_1.findHierarchyNodeFromProvenanceNode(hierarchyRoot, this.traverser.graph.current);
        var tree = gratzl_1.default(hierarchyRoot, currentHierarchyNode);
        this.hierarchyRoot = tree;
        var treeNodes = tree.descendants();
        console.log(treeNodes);
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
        newNodes.append('rect')
            .attr('width', 40)
            .attr('height', 20)
            .attr('x', function (d) { return d.x - 20; })
            .attr('y', function (d) { return -10; })
            .attr('stroke', 'none')
            .attr('fill', function (d) { return d.data.wrappedNodes[0].action ? _this.colorScheme(d.data.wrappedNodes[0].action.metadata.taskId) : 'none'; })
            .attr('fill-opacity', 0.8)
            .on('mouseover', function (d) {
            newNodes.append('text')
                .attr('class', 'taskName')
                .attr('x', function (data) { return data.x - 30; })
                .attr('y', function (data) { return data.y - 5; })
                .text(d.data.wrappedNodes[0].action.metadata.taskName);
        })
            .on('mouseout', function () {
            d3.select('.taskName').remove();
        });
        // node label
        newNodes
            .append('text')
            .attr('class', 'circle-label')
            .text(function (d) { return aggregation_objects_1.groupNodeLabel(d.data); }) // .text(d => d.data.neighbour.toString())
            .attr('x', 7)
            .attr('alignment-baseline', 'central')
            .call(this.wrap, 70);
        var updateNodes = newNodes.merge(oldNodes);
        updateNodes.selectAll('g.normal').remove();
        updateNodes.selectAll('g.bookmarked').remove();
        updateNodes.selectAll('.circle-text').remove();
        var getNodeSize = function (node) {
            return Math.min(2.7 + 0.3 * node.wrappedNodes.length, 7);
        };
        // set nodes containing Slides to square
        updateNodes
            .filter(function (d) {
            return d.data.wrappedNodes.some(function (node) { return node.metadata.isSlideAdded; });
        })
            .append('g')
            .attr('class', 'bookmarked')
            .append('rect')
            .attr('fill', function (d) {
            return d.data.wrappedNodes[0].metadata.bgColor;
        })
            .attr('width', function (d) { return 2 * getNodeSize(d.data); })
            .attr('height', function (d) { return 2 * getNodeSize(d.data); })
            .attr('x', function (d) { return -getNodeSize(d.data); })
            .attr('y', function (d) { return -getNodeSize(d.data); });
        // other nodes to circle
        updateNodes
            .filter(function (d) {
            return !d.data.wrappedNodes.some(function (node) { return node.metadata.isSlideAdded; });
        })
            .append('g')
            .attr('class', 'normal');
        updateNodes
            .select('g')
            .append('circle')
            .attr('class', function (d) {
            var classString = '';
            if (aggregation_objects_1.isKeyNode(d.data.wrappedNodes[0])) {
                classString += ' keynode';
            }
            classString += ' intent_' + aggregation_objects_1.getNodeIntent(d.data.wrappedNodes[0]);
            return classString;
        })
            .attr('r', function (d) { return getNodeSize(d.data); });
        // set node size text in circles / rects
        updateNodes
            .select('g')
            .append('text')
            .attr('class', 'circle-text')
            .attr('text-anchor', 'middle')
            .attr('alignment-baseline', 'central')
            .text(function (d) { return d.data.wrappedNodes.length.toString(); });
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
        // set node-active class if node contains current provenance node
        updateNodes
            .filter(function (d) {
            return d.data.wrappedNodes.includes(_this.traverser.graph.current);
        })
            .attr('class', 'node branch-active neighbour node-active');
        updateNodes
            .data(treeNodes)
            .transition()
            .duration(500)
            .attr('transform', function (d) { return "translate(" + d.x * xScale + ", " + d.y * yScale + ")"; });
        var oldLinks = this.g
            .selectAll('path.link')
            .data(tree.links(), function (d) {
            return d.target.data.wrappedNodes.map(function (n) { return n.id; }).join();
        });
        oldLinks.exit().remove();
        var newLinks = oldLinks
            .enter()
            .insert('path', 'g')
            .attr('d', this.linkPath);
        oldLinks
            .merge(newLinks)
            .attr('class', 'link')
            .filter(function (d) { return d.target.x === 0; })
            .attr('class', 'link active');
        oldLinks
            .merge(newLinks)
            .transition()
            .duration(500)
            .attr('d', this.linkPath);
        var updatedLinks = oldLinks.merge(newLinks);
        if (this.caterpillarActivated) {
            caterpillar_1.caterpillar(updateNodes, treeNodes, updatedLinks, this);
        }
        // Update title
        d3.select('#DataAggregation').text(this.aggregation.aggregator.name);
    }; // end update
    ProvenanceTreeVisualization.prototype.getTraverser = function () {
        return this.traverser;
    };
    return ProvenanceTreeVisualization;
}());
exports.ProvenanceTreeVisualization = ProvenanceTreeVisualization;
//# sourceMappingURL=provenance-tree-visualization.js.map