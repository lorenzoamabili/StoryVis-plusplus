"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var legendData = {
    legends: [
        {
            name: 'Provenance Node',
            color: '#fff',
            shape: 'circle'
        },
        {
            name: 'Bookmarked Node',
            color: '#fff',
            shape: 'rect'
        },
        {
            name: 'selection',
            color: '#286090',
            shape: 'circle'
        },
        {
            name: 'configuration',
            color: '#b8852c',
            shape: 'circle'
        },
        {
            name: 'exploration',
            color: '#60aa85',
            shape: 'circle'
        },
        {
            name: 'provenance',
            color: '#9210dd',
            shape: 'circle'
        },
        {
            name: 'derivation',
            color: '#a94442',
            shape: 'circle'
        }
    ]
};
function addLegend(elm) {
    var legendContainer = elm.append('div').attr('class', 'legend');
    var legendList = legendContainer.append('ul');
    var listItem = legendList
        .selectAll('li')
        .data(legendData.legends)
        .enter()
        .append('li');
    listItem
        .append('div')
        .attr('class', function (d) { return (d.shape === 'circle' ? 'circle' : 'rect'); })
        .attr('style', function (d) { return "background-color:" + d.color; });
    listItem.append('span').text(function (d) {
        return d.name;
    });
}
exports.addLegend = addLegend;
//# sourceMappingURL=legend.js.map