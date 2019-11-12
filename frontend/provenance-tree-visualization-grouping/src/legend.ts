import * as d3 from 'd3';
const legendData = {
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
export function addLegend(elm: any) {
  const legendContainer = elm.append('div').attr('class', 'legend');
  const legendList = legendContainer.append('ul');
  const listItem = legendList
    .selectAll('li')
    .data(legendData.legends)
    .enter()
    .append('li');
  listItem
    .append('div')
    .attr('class', (d: any) => (d.shape === 'circle' ? 'circle' : 'rect'))
    .attr('style', (d: any) => `background-color:${d.color}`);
  listItem.append('span').text((d: any) => {
    return d.name;
  });
}
