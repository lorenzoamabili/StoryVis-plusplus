"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var d3 = require("d3");
var aggregation_objects_1 = require("./aggregation/aggregation-objects");
var legend_1 = require("./legend");
function setTitle(elm, onClick) {
    elm
        .append('div')
        .attr('id', 'DataAggregationTitle')
        .attr('style', 'text-align: center;')
        .append('text')
        .attr('class', 'titleAggregation')
        .attr('id', 'DataAggregation')
        .text('Raw Data')
        .on('click', onClick)
        .attr('style', 'cursor:pointer');
}
exports.setTitle = setTitle;
/**
 * @description Show the buttons of the user interface.
 */
function addAggregationButtons(elm, provenanceTreeVisualization, aggreg) {
    if (aggreg == "ProvGraph") { }
    else {
        var container = elm.append('div').attr('class', 'container');
        var holder = container.append('div');
        legend_1.addLegend(container);
        holder.attr('id', 'aggregationControls');
        // Data aggregation Div
        var dataDiv = holder.append('div').attr('class', 'dataAggregation-Box');
        // Combobox
        if (aggreg == "PlotTrimmerG") {
            var select = dataDiv
                .append('select')
                .attr('style', 'font-size: 14px')
                .on('change', function () {
                var selectedValue = d3.select('select').property('value');
                provenanceTreeVisualization.aggregation.aggregator = aggregation_objects_1.aggregationObjectsUI1.find(function (aggr) { return aggr.name === selectedValue; });
                showSlider(selectedValue);
                provenanceTreeVisualization.update();
                provenanceTreeVisualization.scaleToFit();
            });
            select
                .selectAll('option')
                .data(aggregation_objects_1.aggregationObjectsUI1)
                .enter()
                .append('option')
                .text(function (d) {
                return d.name;
            });
        }
        else if (aggreg == "PlotTrimmerC") {
            var select = dataDiv
                .append('select')
                .attr('style', 'font-size: 14px')
                .on('change', function () {
                var selectedValue = d3.select('select').property('value');
                provenanceTreeVisualization.aggregation.aggregator = aggregation_objects_1.aggregationObjectsUI2.find(function (aggr) { return aggr.name === selectedValue; });
                showSlider(selectedValue);
                provenanceTreeVisualization.update();
                provenanceTreeVisualization.scaleToFit();
            });
            select
                .selectAll('option')
                .data(aggregation_objects_1.aggregationObjectsUI2)
                .enter()
                .append('option')
                .text(function (d) {
                return d.name;
            });
        }
        // Arguments Div
        var argDiv = holder.append('div').attr('class', 'dataAggregation-Box');
        addSlider(argDiv, function (val) {
            provenanceTreeVisualization.aggregation.arg = val;
            provenanceTreeVisualization.update();
            provenanceTreeVisualization.scaleToFit();
        });
        var buttonsHolder = holder
            .append('div')
            .attr('class', 'dataAggregation-Box');
    }
    // // Caterpillar Label
    // buttonsHolder
    //   .append('span')
    //   .text('Caterpillar :')
    //   .attr('style', 'float:left');
    // const caterpillarButton = buttonsHolder
    //   .append('input')
    //   .attr('type', 'checkbox')
    //   .attr('class', 'caterpillar')
    //   .on('change', () => {
    //     provenanceTreeVisualization.caterpillarActivated = !provenanceTreeVisualization.caterpillarActivated;
    //     provenanceTreeVisualization.update();
    //     provenanceTreeVisualization.scaleToFit();
    //   });
}
exports.addAggregationButtons = addAggregationButtons;
/**
 * @description Slider for Arguments in simple HTML
 */
function addSlider(elem, onChange) {
    var container = elem.append('div');
    container.attr('class', 'sliderContainer');
    container.attr('style', 'visibility: hidden');
    var slider = container
        .append('input')
        .attr('id', 'arg')
        .attr('type', 'range')
        .attr('min', 0)
        .attr('max', 10)
        .attr('value', '0')
        .attr('class', 'slider');
    var currentValue = container.append('span').text(0);
    slider.on('change', function () {
        var val = parseInt(slider.node().value, 10);
        currentValue.text(val);
        onChange(val);
    });
}
exports.addSlider = addSlider;
function showSlider(value) {
    var slider = d3.select('.sliderContainer');
    switch (value) {
        case 'Pruning':
        case 'PlotTrimmer':
        case 'PlotTrimmer C':
        case 'PlotTrimmer G':
            slider.attr('style', 'display:block');
            break;
        default:
            slider.attr('style', 'display: none');
    }
}
//# sourceMappingURL=components.js.map