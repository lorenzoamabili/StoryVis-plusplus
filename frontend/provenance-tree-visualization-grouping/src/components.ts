import * as d3 from 'd3';
import { ProvenanceTreeVisualization } from './provenance-tree-visualization';
import { addLegend, addCommandsList, addInstructionsList} from './legend';
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
  provenanceTreeVisualization: ProvenanceTreeVisualization
) {
  const container = elm.append('div').attr('class', 'container');

  // const holder = container.append('div');
  addLegend(container);
  addCommandsList(container);
  addInstructionsList(container);

    // legendButton

    const legendButton = provenanceTreeVisualization.container
    .append('button')
    .attr('id', 'minimap-trigger')
    .attr('class', 'mat-icon-button mat-button-base mat-primary')
    .attr('color', 'primary')
    .attr('style', 'position: absolute; color: orange; z-index: 1; bottom: 2px; background-color: snow;')
    .attr('ng-reflect-color', 'primary')
    .on('mousedown', () => {
      const visible = d3.select("#legendContainer").style('display') === 'block';
      if (visible) {
        d3.select("#legendContainer").style('display', 'none');
        d3.select("#commandsContainer").style('display', 'none');
        d3.select("#instructionsContainer").style('display', 'none');
        provenanceTreeVisualization.update();
        // provenanceTreeVisualization.scaleToFit();
      } else {
        d3.select("#legendContainer").style('display', 'block');
        d3.select("#commandsContainer").style('display', 'block');
        d3.select("#instructionsContainer").style('display', 'block');
        provenanceTreeVisualization.update();
        // provenanceTreeVisualization.scaleToFit();
      }
    });

  legendButton
    .append('span')
    .attr('class', 'mat-button-wrapper')
    .append('mat-icon')
    .attr('class', 'mat-icon notranslate material-icons mat-icon-no-color')
    .attr('role', 'img')
    .attr('aria-hidden', 'true')
    .text('list');

  legendButton
    .append('div')
    .attr('class', 'mat-button-ripple mat-ripple mat-button-ripple-round')
    .attr('ng-reflect-centered', 'true')
    .attr('ng-reflect-disabled', 'false')
    .attr('ng-reflect-trigger', '[object HTMLButtonElement]');

  legendButton
    .append('div')
    .attr('class', 'mat-button-focus-overlay');
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
