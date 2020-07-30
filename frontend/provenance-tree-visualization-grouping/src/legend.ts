import * as d3 from 'd3';
const legendData = {
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
    // .attr('class', (d: any) => (d.shape === 'circle' ? 'circle' : 'rect'))
    .attr('class', (d: any) => (d.name === 'bookmark' ? 'bookmark' : 'circle'))
    .attr('style', (d: any) => `background-color:${d.color}`);
  listItem.append('span').text((d: any) => {
    return d.name;
  });
}
