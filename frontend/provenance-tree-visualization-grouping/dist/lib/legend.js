"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addLegend = void 0;
var legendData = {
    legends: [
        // {
        //   name: 'Provenance Node',
        //   color: '#fff',
        //   shape: 'circle'
        // },
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
        // .attr('class', (d: any) => (d.shape === 'circle' ? 'circle' : 'rect'))
        .attr('class', function (d) { return (d.name === 'bookmark' ? 'bookmark' : 'circle'); })
        .attr('style', function (d) { return "background-color:" + d.color; });
    listItem.append('span').text(function (d) {
        return d.name;
    });
}
exports.addLegend = addLegend;
//# sourceMappingURL=legend.js.map