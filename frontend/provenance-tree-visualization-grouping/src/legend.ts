const legendData = {
  legends: [
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
  ],
  commands: [
    'HOW TO PERFORM SOME INTERACTIONS:',
    '- RIGHT CLICK+MOUSE MOVE on imaging data = To zoom the imaging data',
    '- SHIFT+CLICK on imaging data = To magnify a view', 
    '- ALT+RIGHT CLICK on measurements = To delete a measurement',
    '- RIGHT CLICK on graph nodes = To bookmark a node',
    '- SCROLL on graph = To zoom the graph',
    '- SCROLL on storyline = To scale the graph',
    '- SCROLL+SHIFT on storyline = To slide the graph'
  ],
  instructions: [
    'TASKS TO BE PERFORMED:',
    '- TASK 1 = Explore the imaging data to find all nodules/anomalies in it.',
    '- TASK 2 = Measure the diameter of all the nodules/anomalies found in the imaging data.', 
    '- TASK 3 = Create annotations and/or make additional measurements on the nodules/anomalies found in the imaging data.',
    '- TASK 4 = Create a report to communicate your findings to collaborators.'
  ]
};

export function addLegend(elm: any) {
  const legendContainer = elm.append('div').attr('class', 'legend').attr('id', 'legendContainer').attr('style', 'display: none;');
  const legendList = legendContainer.append('ul');
  const listItem = legendList
    .selectAll('li')
    .data(legendData.legends)
    .enter()
    .append('li');
  listItem
    .append('div')
    .attr('class', (d: any) => {
      if (d.name === 'bookmark') {
        return 'bookmark';
      } else if (d.name === 'story') {
        return 'story';
      } else if (d.name === 'loaded') {
        return 'loaded';
      } else {
        return 'circle';
      }
    })
    .attr('style', (d: any) => `background-color:${d.color}`);
  listItem.append('span').text((d: any) => {
    return d.name;
  });
}

export function addCommandsList(elm: any) {
  const commandsContainer = elm.append('div').attr('class', 'legend')
    .attr('id', 'commandsContainer').attr('style', 'display: none;');
  const commandsList = commandsContainer.append('ul');
  const commandsListItem = commandsList
    .selectAll('li')
    .data(legendData.commands)
    .enter()
    .append('li');
  commandsListItem
    .append('div')

  commandsListItem.append('span').text((d: any) => {
    return d;
  });
}
  export function addInstructionsList(elm: any) {
    const instructionsContainer = elm.append('div').attr('class', 'legend')
      .attr('id', 'instructionsContainer').attr('style', 'margin-bottom: 50px; display: none;');
    const instructionsList = instructionsContainer.append('ul');
    const instructionsListItem = instructionsList
      .selectAll('li')
      .data(legendData.instructions)
      .enter()
      .append('li');
      instructionsListItem
      .append('div')
    instructionsListItem.append('span').text((d: any) => {
      return d;
    });
  }