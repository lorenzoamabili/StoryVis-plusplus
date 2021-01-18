import * as d3 from 'd3';
import { ProvenanceTreeVisualization } from './provenance-tree-visualization';
import { addLegend, addCommandsList, addInstructionsList } from './legend';
import { StateNode } from '@visualstorytelling/provenance-core';

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








  const upwardButton = provenanceTreeVisualization.container
    .append('button')
    .attr('id', 'upward-trigger')
    .attr('class', 'mat-icon-button mat-button-base mat-primary')
    .attr('color', 'primary')
    .attr('style', 'position: absolute; z-index: 1; top: 2px;')
    .attr('ng-reflect-color', 'primary')
    .on('mousedown', () => {
      if (provenanceTreeVisualization.traverser.graph.current.label !== 'Root') {
        provenanceTreeVisualization.traverser.toStateNode((provenanceTreeVisualization.traverser.graph.current as StateNode).parent.id, 250);
        provenanceTreeVisualization.update();
      }
    });

  upwardButton
    .append('span')
    .attr('class', 'mat-button-wrapper')
    .append('mat-icon')
    .attr('class', 'mat-icon notranslate material-icons mat-icon-no-color')
    .attr('role', 'img')
    .attr('aria-hidden', 'true')
    .text('arrow_upward');

  upwardButton
    .append('div')
    .attr('class', 'mat-button-ripple mat-ripple mat-button-ripple-round')
    .attr('ng-reflect-centered', 'true')
    .attr('ng-reflect-disabled', 'false')
    .attr('ng-reflect-trigger', '[object HTMLButtonElement]');

  upwardButton
    .append('div')
    .attr('class', 'mat-button-focus-overlay');









  const downwardButton = provenanceTreeVisualization.container
    .append('button')
    .attr('id', 'downward-trigger')
    .attr('class', 'mat-icon-button mat-button-base mat-primary')
    .attr('color', 'primary')
    .attr('style', 'position: absolute; z-index: 1; top: 45px;')
    .attr('ng-reflect-color', 'primary')
    .on('mousedown', () => {
      if (provenanceTreeVisualization.traverser.graph.current.children[0]) {
        provenanceTreeVisualization.traverser.toStateNode(provenanceTreeVisualization.traverser.graph.current.children[0].id, 250);
        provenanceTreeVisualization.update();
      }
    });

  downwardButton
    .append('span')
    .attr('class', 'mat-button-wrapper')
    .append('mat-icon')
    .attr('class', 'mat-icon notranslate material-icons mat-icon-no-color')
    .attr('role', 'img')
    .attr('aria-hidden', 'true')
    .text('arrow_downward');

  downwardButton
    .append('div')
    .attr('class', 'mat-button-ripple mat-ripple mat-button-ripple-round')
    .attr('ng-reflect-centered', 'true')
    .attr('ng-reflect-disabled', 'false')
    .attr('ng-reflect-trigger', '[object HTMLButtonElement]');

  downwardButton
    .append('div')
    .attr('class', 'mat-button-focus-overlay');


  const newAnalysisButton = provenanceTreeVisualization.container
    .append('button')
    .attr('id', 'newAnalysis-trigger')
    .attr('class', 'mat-icon-button mat-button-base mat-primary')
    .attr('color', 'primary')
    .attr('style', 'position: absolute; z-index: 1; top: 95px;')
    .attr('ng-reflect-color', 'primary')
    .on('mousedown', () => { (window as any).tree.settings.canvas.provenance.generation(); });

  newAnalysisButton
    .append('span')
    .attr('class', 'mat-button-wrapper')
    .append('mat-icon')
    .attr('class', 'mat-icon notranslate material-icons mat-icon-no-color')
    .attr('role', 'img')
    .attr('aria-hidden', 'true')
    .text('add_circle_outline');

  newAnalysisButton
    .append('div')
    .attr('class', 'mat-button-ripple mat-ripple mat-button-ripple-round')
    .attr('ng-reflect-centered', 'true')
    .attr('ng-reflect-disabled', 'false')
    .attr('ng-reflect-trigger', '[object HTMLButtonElement]');

  newAnalysisButton
    .append('div')
    .attr('class', 'mat-button-focus-overlay');








  const newAnalysisFromCurrentNodeButton = provenanceTreeVisualization.container
    .append('button')
    .attr('id', 'newAnalysisFromCurrentNode-trigger')
    .attr('class', 'mat-icon-button mat-button-base mat-primary')
    .attr('color', 'primary')
    .attr('style', 'position: absolute; z-index: 1; top: 145px;')
    .attr('ng-reflect-color', 'primary')
    .on('mousedown', () => { (window as any).tree.settings.canvas.provenance.fission(); });

  newAnalysisFromCurrentNodeButton
    .append('span')
    .attr('class', 'mat-button-wrapper')
    .append('mat-icon')
    .attr('class', 'mat-icon notranslate material-icons mat-icon-no-color')
    .attr('role', 'img')
    .attr('aria-hidden', 'true')
    .text('add_circle');

  newAnalysisFromCurrentNodeButton
    .append('div')
    .attr('class', 'mat-button-ripple mat-ripple mat-button-ripple-round')
    .attr('ng-reflect-centered', 'true')
    .attr('ng-reflect-disabled', 'false')
    .attr('ng-reflect-trigger', '[object HTMLButtonElement]');

  newAnalysisFromCurrentNodeButton
    .append('div')
    .attr('class', 'mat-button-focus-overlay');





  const splittingButton = provenanceTreeVisualization.container
    .append('button')
    .attr('id', 'splitting-trigger')
    .attr('class', 'mat-icon-button mat-button-base mat-primary')
    .attr('color', 'primary')
    .attr('style', 'position: absolute; z-index: 1; top: 195px;')
    .attr('ng-reflect-color', 'primary')
    .on('mousedown', () => { (window as any).tree.settings.canvas.provenance.splitting(); });

  splittingButton
    .append('span')
    .attr('class', 'mat-button-wrapper')
    .append('mat-icon')
    .attr('class', 'mat-icon notranslate material-icons mat-icon-no-color')
    .attr('role', 'img')
    .attr('aria-hidden', 'true')
    .text('call_split');

  splittingButton
    .append('div')
    .attr('class', 'mat-button-ripple mat-ripple mat-button-ripple-round')
    .attr('ng-reflect-centered', 'true')
    .attr('ng-reflect-disabled', 'false')
    .attr('ng-reflect-trigger', '[object HTMLButtonElement]');

  splittingButton
    .append('div')
    .attr('class', 'mat-button-focus-overlay');










  const transferringButton = provenanceTreeVisualization.container
    .append('button')
    .attr('id', 'transferring-trigger')
    .attr('class', 'mat-icon-button mat-button-base mat-primary')
    .attr('color', 'primary')
    .attr('style', 'position: absolute; z-index: 1; top: 245px;')
    .attr('ng-reflect-color', 'primary')
    .on('mousedown', () => {
      if ((window as any).tree._viz.transferringEnabled === false) {
        transferringButton.attr('class', 'mat-icon-button mat-button-base mat-primary checked');
        mergingButton.attr('class', 'mat-icon-button mat-button-base mat-primary');
        copyingButton.attr('class', 'mat-icon-button mat-button-base mat-primary');
        (window as any).tree._viz.mergingEnabled = false;
        (window as any).tree._viz.copyingEnabled = false;
        (window as any).tree._viz.transferringEnabled = true;
      } else {
        transferringButton.attr('class', 'mat-icon-button mat-button-base mat-primary');
        (window as any).tree._viz.transferringEnabled = false;
      }
    });


    transferringButton
    .append('span')
    .attr('class', 'mat-button-wrapper')
    .append('mat-icon')
    .attr('class', 'mat-icon notranslate material-icons mat-icon-no-color')
    .attr('role', 'img')
    .attr('aria-hidden', 'true')
    .text('swap_horiz');

    transferringButton
    .append('div')
    .attr('class', 'mat-button-ripple mat-ripple mat-button-ripple-round')
    .attr('ng-reflect-centered', 'true')
    .attr('ng-reflect-disabled', 'false')
    .attr('ng-reflect-trigger', '[object HTMLButtonElement]');

    transferringButton
    .append('div')
    .attr('class', 'mat-button-focus-overlay');












  const mergingButton = provenanceTreeVisualization.container
    .append('button')
    .attr('id', 'merging-trigger')
    .attr('class', 'mat-icon-button mat-button-base mat-primary')
    .attr('color', 'primary')
    .attr('style', 'position: absolute; z-index: 1; top: 295px;')
    .attr('ng-reflect-color', 'primary')
    .on('mousedown', () => {
      if ((window as any).tree._viz.mergingEnabled === false) {
        mergingButton.attr('class', 'mat-icon-button mat-button-base mat-primary checked');
        transferringButton.attr('class', 'mat-icon-button mat-button-base mat-primary');
        copyingButton.attr('class', 'mat-icon-button mat-button-base mat-primary');
        (window as any).tree._viz.copyingEnabled = false;
        (window as any).tree._viz.transferringEnabled = false;
        (window as any).tree._viz.mergingEnabled = true;
      } else {
        mergingButton.attr('class', 'mat-icon-button mat-button-base mat-primary');
        (window as any).tree._viz.mergingEnabled = false;
      }
    });


    mergingButton
    .append('span')
    .attr('class', 'mat-button-wrapper')
    .append('mat-icon')
    .attr('class', 'mat-icon notranslate material-icons mat-icon-no-color')
    .attr('role', 'img')
    .attr('aria-hidden', 'true')
    .text('merge_type');
    
    mergingButton
    .append('div')
    .attr('class', 'mat-button-ripple mat-ripple mat-button-ripple-round')
    .attr('ng-reflect-centered', 'true')
    .attr('ng-reflect-disabled', 'false')
    .attr('ng-reflect-trigger', '[object HTMLButtonElement]');

    mergingButton
    .append('div')
    .attr('class', 'mat-button-focus-overlay');












  const copyingButton = provenanceTreeVisualization.container
    .append('button')
    .attr('id', 'copying-trigger')
    .attr('class', 'mat-icon-button mat-button-base mat-primary')
    .attr('color', 'primary')
    .attr('style', 'position: absolute; z-index: 1; top: 345px;')
    .attr('ng-reflect-color', 'primary')
    .on('mousedown', () => {
      if ((window as any).tree._viz.copyingEnabled === false) {
        copyingButton.attr('class', 'mat-icon-button mat-button-base mat-primary checked');
        mergingButton.attr('class', 'mat-icon-button mat-button-base mat-primary');
        transferringButton.attr('class', 'mat-icon-button mat-button-base mat-primary');
        (window as any).tree._viz.transferringEnabled = false;
        (window as any).tree._viz.mergingEnabled = false;
        (window as any).tree._viz.copyingEnabled = true;
      } else {
        copyingButton.attr('class', 'mat-icon-button mat-button-base mat-primary');
        (window as any).tree._viz.copyingEnabled = false;
      }
    });


    copyingButton
    .append('span')
    .attr('class', 'mat-button-wrapper')
    .append('mat-icon')
    .attr('class', 'mat-icon notranslate material-icons mat-icon-no-color')
    .attr('role', 'img')
    .attr('aria-hidden', 'true')
    .text('queue');

    copyingButton
    .append('div')
    .attr('class', 'mat-button-ripple mat-ripple mat-button-ripple-round')
    .attr('ng-reflect-centered', 'true')
    .attr('ng-reflect-disabled', 'false')
    .attr('ng-reflect-trigger', '[object HTMLButtonElement]');

    copyingButton
    .append('div')
    .attr('class', 'mat-button-focus-overlay');










//   const mergingButton = provenanceTreeVisualization.container
//     .append('button')
//     .attr('id', 'merging-trigger')
//     .attr('class', 'mat-icon-button mat-button-base mat-primary')
//     .attr('color', 'primary')
//     .attr('style', 'position: absolute; z-index: 1; top: 345px;')
//     .attr('ng-reflect-color', 'primary')
//     .on('mousedown', () => {
//       if ((window as any).tree._viz.mergingEnabled === false) {
//         mergingButton.attr('class', 'mat-icon-button mat-button-base mat-primary checked');
//         transferringButton.attr('class', 'mat-icon-button mat-button-base mat-primary');
//         copyingButton.attr('class', 'mat-icon-button mat-button-base mat-primary');
//         (window as any).tree._viz.mergingEnabled = true;
//         (window as any).tree._viz.splittingEnabled = false;
//         (window as any).tree._viz.doublingEnabled = false;
//         (window as any).tree._viz.transferringEnabled = false;
//       } else {
//         mergingButton.attr('class', 'mat-icon-button mat-button-base mat-primary');
//         (window as any).tree._viz.mergingEnabled = false;
//       }
//     });


//   mergingButton
//     .append('span')
//     .attr('class', 'mat-button-wrapper')
//     .append('mat-icon')
//     .attr('class', 'mat-icon notranslate material-icons mat-icon-no-color')
//     .attr('role', 'img')
//     .attr('aria-hidden', 'true')
//     .text('merge_type');

//   mergingButton
//     .append('div')
//     .attr('class', 'mat-button-ripple mat-ripple mat-button-ripple-round')
//     .attr('ng-reflect-centered', 'true')
//     .attr('ng-reflect-disabled', 'false')
//     .attr('ng-reflect-trigger', '[object HTMLButtonElement]');

//   mergingButton
//     .append('div')
//     .attr('class', 'mat-button-focus-overlay');
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
