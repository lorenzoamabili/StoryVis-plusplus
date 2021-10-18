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
    '- ALT+UPWARD ARROW = Go to the previous node',
    '- ALT+DOWNWARD ARROW = Go to the next node',
    '- ALT+X = Go to the root',
    '- ALT+IntlBackslash = Add all nodes to the slide deck',
    '- ALT+1 = Add neighbour nodes to the slide deck',
    '- ALT+W = Add annotation/derivation nodes to the slide deck',
    '- ALT+CLICK = Add slide to the dashboard',
    '- RIGHT-CLICK DRAGGING on imaging data = To zoom the imaging data',
    '- SHIFT+CLICK on imaging data = To magnify a view', 
    '- ALT+RIGHT CLICK on measurements = To delete a measurement',
    '- RIGHT CLICK on graph nodes = To bookmark a node and to add one slide representing the current state to the storyline',
    '- SCROLLING on graph = To zoom the graph',
    '- SCROLLING on storyline = To slide the graph',
    '- SHIFT+SCROLLING on storyline = To scale the graph'
  ],
  tasks: [
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
  export function addtasksList(elm: any) {
    const tasksContainer = elm.append('div').attr('class', 'legend')
      .attr('id', 'tasksContainer').attr('style', 'margin-bottom: 50px; display: none;');
    const tasksList = tasksContainer.append('ul');
    const tasksListItem = tasksList
      .selectAll('li')
      .data(legendData.tasks)
      .enter()
      .append('li');
      tasksListItem
      .append('div')
    tasksListItem.append('span').text((d: any) => {
      return d;
    });
  }