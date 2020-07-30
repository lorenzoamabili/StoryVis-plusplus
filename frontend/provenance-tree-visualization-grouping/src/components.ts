import * as d3 from 'd3';
import {
  aggregationObjects,
  aggregationObjectsUI1,
  aggregationObjectsUI2,
  wrapNode
} from './aggregation/aggregation-objects';
import {
  connectivity,
  maxDepth
} from './aggregation/aggregation-implementations';
import { ProvenanceTreeVisualization } from './provenance-tree-visualization';
import { addLegend } from './legend';
/**
 * @description Show the title of the data aggregation algorithm used.
 */
export type HTMLDivSelection = d3.Selection<
  HTMLDivElement,
  unknown,
  null,
  undefined
>;
export function setTitle(elm: HTMLDivSelection, onClick: () => any) {
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

/**
 * @description Show the buttons of the user interface.
 */
export function addAggregationButtons(
  elm: HTMLDivSelection,
  provenanceTreeVisualization: ProvenanceTreeVisualization,
  aggreg: string
) {
  const container = elm.append('div').attr('class', 'container');

  const holder = container.append('div');
  addLegend(container);
  holder.attr('id', 'aggregationControls');

  if (aggreg == "ProvGraph") { }
  else {
  
    // Data aggregation Div
    const dataDiv = holder.append('div').attr('class', 'dataAggregation-Box');
    // Combobox
    if (aggreg == "PlotTrimmerG") {
      const select = dataDiv
        .append('select')
        .attr('style', 'font-size: 14px')
        .on('change', () => {
          const selectedValue = d3.select('select').property('value');
          provenanceTreeVisualization.aggregation.aggregator = aggregationObjectsUI1.find(
            aggr => aggr.name === selectedValue
          )!;

          showSlider(selectedValue);
          provenanceTreeVisualization.update();
          provenanceTreeVisualization.scaleToFit();
        });

      select
        .selectAll('option')
        .data(aggregationObjectsUI1)
        .enter()
        .append('option')
        .text(function (d) {
          return d.name;
        });
    } else if (aggreg == "PlotTrimmerC") {
      const select = dataDiv
        .append('select')
        .attr('style', 'font-size: 14px')
        .on('change', () => {
          const selectedValue = d3.select('select').property('value');
          provenanceTreeVisualization.aggregation.aggregator = aggregationObjectsUI2.find(
            aggr => aggr.name === selectedValue
          )!;

          showSlider(selectedValue);
          provenanceTreeVisualization.update();
          provenanceTreeVisualization.scaleToFit();
        });

      select
        .selectAll('option')
        .data(aggregationObjectsUI2)
        .enter()
        .append('option')
        .text(function (d) {
          return d.name;
        });
    }
    // Arguments Div
    const argDiv = holder.append('div').attr('class', 'dataAggregation-Box');

    addSlider(argDiv, val => {
      provenanceTreeVisualization.aggregation.arg = val;
      provenanceTreeVisualization.update();
      provenanceTreeVisualization.scaleToFit();
    });
    const buttonsHolder = holder
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

/**
 * @description Slider for Arguments in simple HTML
 */
export function addSlider<T extends HTMLElement>(
  elem: d3.Selection<T, any, any, any>,
  onChange: (val: number) => any
): void {
  const container = elem.append('div');

  container.attr('class', 'sliderContainer');
  container.attr('style', 'visibility: hidden');

  const slider = container
    .append('input')
    .attr('id', 'arg')
    .attr('type', 'range')
    .attr('min', 0)
    .attr('max', 10)
    .attr('value', '0')
    .attr('class', 'slider');
  const currentValue = container.append('span').text(0);

  slider.on('change', () => {
    const val = parseInt(slider.node()!.value, 10);
    currentValue.text(val);
    onChange(val);
  });
}
function showSlider(value: string) {
  const slider = d3.select('.sliderContainer');
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
