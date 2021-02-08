import * as d3 from 'd3';
import {
  aggregationObjects,
  aggregationObjectsUI1,
  aggregationObjectsUI2,
  wrapNode
} from './aggregation/aggregation-objects';
import { ProvenanceTreeVisualization } from './provenance-tree-visualization';
import { addLegend, addCommandsList, addtasksList } from './legend';
import { StateNode, ProvenanceNode } from '@visualstorytelling/provenance-core';
import { filterObjects } from './filtering';

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

  let der = true;
  let expl = true;
  let sel = true;
  let conf = true;
  let ann = true;
  let prov = true;


  const container = provenanceTreeVisualization.container;
  const holder = container.append('div').attr('class', 'holder').attr('id', 'holderDiv');

  // // Filtering button
  // const filterSlider = holder.append('div').attr('class', 'controlsBox').attr('id', 'filterContainer');

  // filterSlider
  //   .append('p')
  //   .text('Filters: ')
  //   .attr('style', 'font-size: 14px; margin: 0px;');

  // // filterSlider Label
  // var filterNames = ['Der', 'Expl', 'Sel', 'Conf', 'Ann', 'Prov'];
  // filterSlider
  //   .selectAll('input')
  //   .data(filterObjects)
  //   .enter()
  //   .append('input')
  //   .attr('type', 'checkbox')
  //   .attr('value', function (d: any) {
  //     return d.name;
  //   })
  //   .attr('checked', true)
  //   .attr('class', 'filterCheckbox')
  //   .on('change', (d: any) => {
  //     var filters: any[] = [];
  //     d3.selectAll('.filterCheckbox').each(function () {
  //       const input = d3.select(this);
  //       if (input.property("checked")) {
  //         filters.push(filterObjects.find(x => x.name === input.property('value')))
  //       }
  //     })
  //     provenanceTreeVisualization.filter = filters;
  //     provenanceTreeVisualization.update();
  //     provenanceTreeVisualization.scaleToFit();
  //   });

  // filterSlider
  //   .selectAll('span')
  //   .data(filterNames)
  //   .enter()
  //   .append('span')
  //   .attr('style', 'font-size: 12px; margin: 5px;')
  //   .text(function (d: any) {
  //     return d;
  //   });



  // Data aggregation Div
  const dataDiv = holder.append('div').attr('class', 'controlsBox').attr('style', 'z-index: 1;');

  dataDiv
    .append('p')
    .text('Aggregation : ')
    .attr('style', 'font-size: 14px; margin: 0px;');

  // Combobox
  const selectAggr = dataDiv
    .append('select')
    .attr('style', 'font-size: 14px')
    .on('change', () => {
      const selectedValue = d3.select('select').property('value');
      provenanceTreeVisualization.aggregation.aggregator = aggregationObjects.find(
        aggr => aggr.name === selectedValue
      )!;

      showSlider(selectedValue);
      provenanceTreeVisualization.update();
      provenanceTreeVisualization.scaleToFit();
    });

  selectAggr
    .selectAll('option')
    .data(aggregationObjects)
    .enter()
    .append('option')
    .text(function (d: any) {
      return d.name;
    });


  // Arguments Div
  const argDiv = dataDiv.append('div').attr('class', 'controlsBox');

  addSlider(argDiv, val => {
    provenanceTreeVisualization.aggregation.arg = val;
    provenanceTreeVisualization.update();
    provenanceTreeVisualization.scaleToFit();
  });

  // const holder = container.append('div');
  addLegend(container);
  addCommandsList(container);
  addtasksList(container);






  const saveGraphButton = provenanceTreeVisualization.container
    .append('button')
    .attr('id', 'newAnalysis-trigger')
    .attr('class', 'mat-icon-button mat-button-base mat-primary')
    .attr('color', 'primary')
    .attr('style', 'position: absolute; z-index: 1; color: firebrick; top: 1%; right: 1%;')
    .attr('ng-reflect-color', 'primary')
    .on('click', () => { (window as any).canvas.provenance.saveGraph(); })

  saveGraphButton
    .append('span')
    .attr('class', 'mat-button-wrapper')
    .append('mat-icon')
    .attr('class', 'mat-icon notranslate material-icons mat-icon-no-color')
    .attr('role', 'img')
    .attr('aria-hidden', 'true')
    .text('save_alt');

  saveGraphButton
    .append('div')
    .attr('class', 'mat-button-ripple mat-ripple mat-button-ripple-round')
    .attr('ng-reflect-centered', 'true')
    .attr('ng-reflect-disabled', 'false')
    .attr('ng-reflect-trigger', '[object HTMLButtonElement]');

  saveGraphButton
    .append('div')
    .attr('class', 'mat-button-focus-overlay');




  const saveStoryButton = provenanceTreeVisualization.container
    .append('button')
    .attr('id', 'newAnalysis-trigger')
    .attr('class', 'mat-icon-button mat-button-base mat-primary')
    .attr('color', 'primary')
    .attr('style', 'position: absolute; z-index: 1; color: firebrick; top: 4%; right: 1%;')
    .attr('ng-reflect-color', 'primary')
    .on('click', () => { (window as any).canvas.provenance.saveStory(); })

  saveStoryButton
    .append('span')
    .attr('class', 'mat-button-wrapper')
    .append('mat-icon')
    .attr('class', 'mat-icon notranslate material-icons mat-icon-no-color')
    .attr('role', 'img')
    .attr('aria-hidden', 'true')
    .text('video_call');

  saveStoryButton
    .append('div')
    .attr('class', 'mat-button-ripple mat-ripple mat-button-ripple-round')
    .attr('ng-reflect-centered', 'true')
    .attr('ng-reflect-disabled', 'false')
    .attr('ng-reflect-trigger', '[object HTMLButtonElement]');

  saveStoryButton
    .append('div')
    .attr('class', 'mat-button-focus-overlay');






  function goToTheNextUpperNodeAvailable(parentNode: ProvenanceNode) {
    if (!parentNode.metadata.filtered) {
      provenanceTreeVisualization.traverser.toStateNode(parentNode.id, 250);
      provenanceTreeVisualization.update();
    } else {
      if ((parentNode as StateNode).parent) {
        goToTheNextUpperNodeAvailable(((parentNode as StateNode).parent));
      }
    }
  }



  const upwardButton = provenanceTreeVisualization.container
    .append('button')
    .attr('id', 'upward-trigger')
    .attr('class', 'mat-icon-button mat-button-base mat-primary')
    .attr('color', 'primary')
    .attr('style', 'position: absolute; color: indianred; z-index: 1; top: 1%;')
    .attr('ng-reflect-color', 'primary')
    .on('mousedown', () => {
      if (provenanceTreeVisualization.storyOrderLayoutActivated) {
        provenanceTreeVisualization.navigateLinearizedGraphUp = true;
        provenanceTreeVisualization.update();
      } else if ((provenanceTreeVisualization.traverser.graph.current as StateNode).parent) {
        goToTheNextUpperNodeAvailable((provenanceTreeVisualization.traverser.graph.current as StateNode).parent);
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






  function goToTheNextLowerNodeAvailable(node: ProvenanceNode) {
    for (const child of node.children) {
      if ((child as StateNode).metadata.mainbranch) {
        if (!(child as StateNode).metadata.filtered) {
          provenanceTreeVisualization.traverser.toStateNode(child.id, 250);
          provenanceTreeVisualization.update();
          break;
        } else {
          if (child.children[0]) {
            goToTheNextLowerNodeAvailable(child);
          }
          break;
        }
      }
    }
  }


  const downwardButton = provenanceTreeVisualization.container
    .append('button')
    .attr('id', 'downward-trigger')
    .attr('class', 'mat-icon-button mat-button-base mat-primary')
    .attr('color', 'primary')
    .attr('style', 'position: absolute; color: indianred; z-index: 1; top: 4%;')
    .attr('ng-reflect-color', 'primary')
    .on('mousedown', () => {
      if (provenanceTreeVisualization.storyOrderLayoutActivated) {
        provenanceTreeVisualization.navigateLinearizedGraphDown = true;
        provenanceTreeVisualization.update();
      } else if (provenanceTreeVisualization.traverser.graph.current.children[0]) {
        goToTheNextLowerNodeAvailable(provenanceTreeVisualization.traverser.graph.current);
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
    .attr('style', 'position: absolute; z-index: 1; top: 8%;')
    .attr('ng-reflect-color', 'primary')
    .on('click', () => { (window as any).canvas.provenance.generation(true); })
    .on('contextmenu', () => { (window as any).canvas.provenance.generation(); });

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
    .attr('style', 'position: absolute; z-index: 1; top: 11%;')
    .attr('ng-reflect-color', 'primary')
    .on('click', () => { (window as any).canvas.provenance.fission(true); })
    .on('contextmenu', () => { (window as any).canvas.provenance.fission(); });


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
    .attr('style', 'position: absolute; z-index: 1; top: 14%;')
    .attr('ng-reflect-color', 'primary')
    .on('mousedown', () => { (window as any).canvas.provenance.splitting(); });

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
    .attr('style', 'position: absolute; z-index: 1; top: 17%;')
    .attr('ng-reflect-color', 'primary')
    .on('mousedown', () => {
      if (provenanceTreeVisualization.transferringEnabled === false) {
        transferringButton.attr('class', 'mat-icon-button mat-button-base mat-primary checked');
        mergingButton.attr('class', 'mat-icon-button mat-button-base mat-primary');
        copyingButton.attr('class', 'mat-icon-button mat-button-base mat-primary');
        provenanceTreeVisualization.mergingEnabled = false;
        provenanceTreeVisualization.copyingEnabled = false;
        provenanceTreeVisualization.transferringEnabled = true;
      } else {
        transferringButton.attr('class', 'mat-icon-button mat-button-base mat-primary');
        provenanceTreeVisualization.transferringEnabled = false;
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
    .attr('style', 'position: absolute; z-index: 1; top: 20%;')
    .attr('ng-reflect-color', 'primary')
    .on('click', () => {
      if (provenanceTreeVisualization.mergingEnabled === false) {
        mergingButton.attr('class', 'mat-icon-button mat-button-base mat-primary checked');
        transferringButton.attr('class', 'mat-icon-button mat-button-base mat-primary');
        copyingButton.attr('class', 'mat-icon-button mat-button-base mat-primary');
        provenanceTreeVisualization.copyingEnabled = false;
        provenanceTreeVisualization.transferringEnabled = false;
        provenanceTreeVisualization.mergingEnabled = true;
      } else {
        mergingButton.attr('class', 'mat-icon-button mat-button-base mat-primary');
        provenanceTreeVisualization.mergingEnabled = false;
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
    .attr('style', 'position: absolute; z-index: 1; top: 23%;')
    .attr('ng-reflect-color', 'primary')
    .on('mousedown', () => {
      if (provenanceTreeVisualization.copyingEnabled === false) {
        copyingButton.attr('class', 'mat-icon-button mat-button-base mat-primary checked');
        mergingButton.attr('class', 'mat-icon-button mat-button-base mat-primary');
        transferringButton.attr('class', 'mat-icon-button mat-button-base mat-primary');
        provenanceTreeVisualization.transferringEnabled = false;
        provenanceTreeVisualization.mergingEnabled = false;
        provenanceTreeVisualization.copyingEnabled = true;
      } else {
        copyingButton.attr('class', 'mat-icon-button mat-button-base mat-primary');
        provenanceTreeVisualization.copyingEnabled = false;
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










  const caterpillarButton = provenanceTreeVisualization.container
    .append('button')
    .attr('id', 'caterpillar-trigger')
    .attr('class', 'mat-icon-button mat-button-base mat-primary')
    .attr('color', 'primary')
    .attr('style', 'position: absolute; color: darkcyan; z-index: 1; top: 28%;')
    .attr('ng-reflect-color', 'primary')
    .on('mousedown', () => {
      if (provenanceTreeVisualization.caterpillarActivated === false) {
        caterpillarButton.attr('class', 'mat-icon-button mat-button-base mat-primary checked');
        provenanceTreeVisualization.caterpillarActivated = !provenanceTreeVisualization.caterpillarActivated;
        provenanceTreeVisualization.update();
        provenanceTreeVisualization.scaleToFit();
      } else {
        caterpillarButton.attr('class', 'mat-icon-button mat-button-base mat-primary');
        provenanceTreeVisualization.caterpillarActivated = !provenanceTreeVisualization.caterpillarActivated;
        provenanceTreeVisualization.update();
        provenanceTreeVisualization.scaleToFit();
      }
    });


  caterpillarButton
    .append('span')
    .attr('class', 'mat-button-wrapper')
    .append('mat-icon')
    .attr('class', 'mat-icon notranslate material-icons mat-icon-no-color')
    .attr('role', 'img')
    .attr('aria-hidden', 'true')
    .text('more_vert');

  caterpillarButton
    .append('div')
    .attr('class', 'mat-button-ripple mat-ripple mat-button-ripple-round')
    .attr('ng-reflect-centered', 'true')
    .attr('ng-reflect-disabled', 'false')
    .attr('ng-reflect-trigger', '[object HTMLButtonElement]');

  caterpillarButton
    .append('div')
    .attr('class', 'mat-button-focus-overlay');





  const elasticTreeButton = provenanceTreeVisualization.container
    .append('button')
    .attr('id', 'elastictree-trigger')
    .attr('class', 'mat-icon-button mat-button-base mat-primary')
    .attr('color', 'primary')
    .attr('style', 'position: absolute; color: darkcyan; z-index: 1; top: 31%;')
    .attr('ng-reflect-color', 'primary')
    .on('mousedown', () => {
      if (provenanceTreeVisualization.elasticTreeLayoutActivated === false) {
        elasticTreeButton.attr('class', 'mat-icon-button mat-button-base mat-primary checked');
        provenanceTreeVisualization.elasticTreeLayoutActivated = !provenanceTreeVisualization.elasticTreeLayoutActivated;
        provenanceTreeVisualization.update();
        provenanceTreeVisualization.scaleToFit();
      } else {
        elasticTreeButton.attr('class', 'mat-icon-button mat-button-base mat-primary');
        provenanceTreeVisualization.elasticTreeLayoutActivated = !provenanceTreeVisualization.elasticTreeLayoutActivated;
        provenanceTreeVisualization.update();
        provenanceTreeVisualization.scaleToFit();
      }
    });


  elasticTreeButton
    .append('span')
    .attr('class', 'mat-button-wrapper')
    .append('mat-icon')
    .attr('class', 'mat-icon notranslate material-icons mat-icon-no-color')
    .attr('role', 'img')
    .attr('aria-hidden', 'true')
    .text('gesture');

  elasticTreeButton
    .append('div')
    .attr('class', 'mat-button-ripple mat-ripple mat-button-ripple-round')
    .attr('ng-reflect-centered', 'true')
    .attr('ng-reflect-disabled', 'false')
    .attr('ng-reflect-trigger', '[object HTMLButtonElement]');

  elasticTreeButton
    .append('div')
    .attr('class', 'mat-button-focus-overlay');




  const storyTreeButton = provenanceTreeVisualization.container
    .append('button')
    .attr('id', 'storytree-trigger')
    .attr('class', 'mat-icon-button mat-button-base mat-primary')
    .attr('color', 'primary')
    .attr('style', 'position: absolute; color: darkcyan; z-index: 1; top: 34%;')
    .attr('ng-reflect-color', 'primary')
    .on('mousedown', () => {
      if (provenanceTreeVisualization.storyOrderLayoutActivated === false) {
        storyTreeButton.attr('class', 'mat-icon-button mat-button-base mat-primary checked');
        provenanceTreeVisualization.storyOrderLayoutActivated = !provenanceTreeVisualization.storyOrderLayoutActivated;
        provenanceTreeVisualization.update();
        provenanceTreeVisualization.scaleToFit();
      } else {
        storyTreeButton.attr('class', 'mat-icon-button mat-button-base mat-primary');
        provenanceTreeVisualization.storyOrderLayoutActivated = !provenanceTreeVisualization.storyOrderLayoutActivated;
        provenanceTreeVisualization.update();
        provenanceTreeVisualization.scaleToFit();
      }
    });


  storyTreeButton
    .append('span')
    .attr('class', 'mat-button-wrapper')
    .append('mat-icon')
    .attr('class', 'mat-icon notranslate material-icons mat-icon-no-color')
    .attr('role', 'img')
    .attr('aria-hidden', 'true')
    .text('grid_on');

  storyTreeButton
    .append('div')
    .attr('class', 'mat-button-ripple mat-ripple mat-button-ripple-round')
    .attr('ng-reflect-centered', 'true')
    .attr('ng-reflect-disabled', 'false')
    .attr('ng-reflect-trigger', '[object HTMLButtonElement]');

  storyTreeButton
    .append('div')
    .attr('class', 'mat-button-focus-overlay');










  const autoScalingButton = provenanceTreeVisualization.container
    .append('button')
    .attr('id', 'autoscaling-trigger')
    .attr('class', 'mat-icon-button mat-button-base mat-primary')
    .attr('color', 'primary')
    .attr('style', 'position: absolute; color: darkcyan; z-index: 1; top: 37%;')
    .attr('ng-reflect-color', 'primary')
    .on('mousedown', () => {
      if (provenanceTreeVisualization.autoScaling === false) {
        autoScalingButton.attr('class', 'mat-icon-button mat-button-base mat-primary checked');
        provenanceTreeVisualization.autoScaling = !provenanceTreeVisualization.autoScaling;
        provenanceTreeVisualization.scaleToFit();
      } else {
        autoScalingButton.attr('class', 'mat-icon-button mat-button-base mat-primary');
        provenanceTreeVisualization.autoScaling = !provenanceTreeVisualization.autoScaling;
        provenanceTreeVisualization.scaleToFit();
      }
    });


  autoScalingButton
    .append('span')
    .attr('class', 'mat-button-wrapper')
    .append('mat-icon')
    .attr('class', 'mat-icon notranslate material-icons mat-icon-no-color')
    .attr('role', 'img')
    .attr('aria-hidden', 'true')
    .text('photo_size_select_large');

  autoScalingButton
    .append('div')
    .attr('class', 'mat-button-ripple mat-ripple mat-button-ripple-round')
    .attr('ng-reflect-centered', 'true')
    .attr('ng-reflect-disabled', 'false')
    .attr('ng-reflect-trigger', '[object HTMLButtonElement]');

  autoScalingButton
    .append('div')
    .attr('class', 'mat-button-focus-overlay');












  const derivationButton = provenanceTreeVisualization.container
    .append('button')
    .attr('class', 'mat-icon-button mat-button-base mat-primary')
    .attr('color', 'primary')
    .attr('style', 'position: absolute; z-index: 1; top: 42%;')
    .attr('ng-reflect-color', 'primary')
    .on('mousedown', () => {
      var filters: any[] = [];
      if (der === true) {
        derivationButton.attr('class', 'mat-icon-button mat-button-base mat-primary checked');
        der = false;
      } else {
        derivationButton.attr('class', 'mat-icon-button mat-button-base mat-primary');
        der = true;
      }
      if (der) {
        filters.push(filterObjects.find(x => x.name === 'derivation'))
      }
      if (ann) {
        filters.push(filterObjects.find(x => x.name === 'annotation'))
      }
      if (expl) {
        filters.push(filterObjects.find(x => x.name === 'exploration'))
      }
      if (sel) {
        filters.push(filterObjects.find(x => x.name === 'selection'))
      }
      if (prov) {
        filters.push(filterObjects.find(x => x.name === 'provenance'))
      }
      if (conf) {
        filters.push(filterObjects.find(x => x.name === 'configuration'))
      }


      provenanceTreeVisualization.filter = filters;
      provenanceTreeVisualization.update();
      provenanceTreeVisualization.scaleToFit();
    });

  derivationButton
    .append('span')
    .attr('class', 'mat-button-wrapper')
    .append('mat-icon')
    .attr('id', 'derivation-trigger')
    .attr('class', 'mat-icon notranslate material-icons mat-icon-no-color')
    .attr('role', 'img')
    .attr('aria-hidden', 'true')
    .text('fiber_manual_record');

  derivationButton
    .append('div')
    .attr('class', 'mat-button-ripple mat-ripple mat-button-ripple-round')
    .attr('ng-reflect-centered', 'true')
    .attr('ng-reflect-disabled', 'false')
    .attr('ng-reflect-trigger', '[object HTMLButtonElement]');

  derivationButton
    .append('div')
    .attr('class', 'mat-button-focus-overlay');







  const explorationButton = provenanceTreeVisualization.container
    .append('button')
    .attr('class', 'mat-icon-button mat-button-base mat-primary')
    .attr('color', 'primary')
    .attr('style', 'position: absolute; z-index: 1; top: 45%;')
    .attr('ng-reflect-color', 'primary')
    .on('mousedown', () => {
      var filters: any[] = [];
      if (expl === true) {
        explorationButton.attr('class', 'mat-icon-button mat-button-base mat-primary checked');
        expl = false;
      } else {
        explorationButton.attr('class', 'mat-icon-button mat-button-base mat-primary');
        expl = true;
      }
      if (der) {
        filters.push(filterObjects.find(x => x.name === 'derivation'))
      }
      if (ann) {
        filters.push(filterObjects.find(x => x.name === 'annotation'))
      }
      if (expl) {
        filters.push(filterObjects.find(x => x.name === 'exploration'))
      }
      if (sel) {
        filters.push(filterObjects.find(x => x.name === 'selection'))
      }
      if (prov) {
        filters.push(filterObjects.find(x => x.name === 'provenance'))
      }
      if (conf) {
        filters.push(filterObjects.find(x => x.name === 'configuration'))
      }

      provenanceTreeVisualization.filter = filters;
      provenanceTreeVisualization.update();
      provenanceTreeVisualization.scaleToFit();
    });

  explorationButton
    .append('span')
    .attr('class', 'mat-button-wrapper')
    .append('mat-icon')
    .attr('id', 'exploration-trigger')
    .attr('class', 'mat-icon notranslate material-icons mat-icon-no-color')
    .attr('role', 'img')
    .attr('aria-hidden', 'true')
    .text('fiber_manual_record');

  explorationButton
    .append('div')
    .attr('class', 'mat-button-ripple mat-ripple mat-button-ripple-round')
    .attr('ng-reflect-centered', 'true')
    .attr('ng-reflect-disabled', 'false')
    .attr('ng-reflect-trigger', '[object HTMLButtonElement]');

  explorationButton
    .append('div')
    .attr('class', 'mat-button-focus-overlay');





  const configurationButton = provenanceTreeVisualization.container
    .append('button')
    .attr('class', 'mat-icon-button mat-button-base mat-primary')
    .attr('color', 'primary')
    .attr('style', 'position: absolute; z-index: 1; top: 48%;')
    .attr('ng-reflect-color', 'primary')
    .on('mousedown', () => {
      var filters: any[] = [];
      if (conf === true) {
        configurationButton.attr('class', 'mat-icon-button mat-button-base mat-primary checked');
        conf = false;
      } else {
        configurationButton.attr('class', 'mat-icon-button mat-button-base mat-primary');
        conf = true;
      }
      if (der) {
        filters.push(filterObjects.find(x => x.name === 'derivation'))
      }
      if (ann) {
        filters.push(filterObjects.find(x => x.name === 'annotation'))
      }
      if (expl) {
        filters.push(filterObjects.find(x => x.name === 'exploration'))
      }
      if (sel) {
        filters.push(filterObjects.find(x => x.name === 'selection'))
      }
      if (prov) {
        filters.push(filterObjects.find(x => x.name === 'provenance'))
      }
      if (conf) {
        filters.push(filterObjects.find(x => x.name === 'configuration'))
      }

      provenanceTreeVisualization.filter = filters;
      provenanceTreeVisualization.update();
      provenanceTreeVisualization.scaleToFit();
    });

  configurationButton
    .append('span')
    .attr('class', 'mat-button-wrapper')
    .append('mat-icon')
    .attr('id', 'configuration-trigger')
    .attr('class', 'mat-icon notranslate material-icons mat-icon-no-color')
    .attr('role', 'img')
    .attr('aria-hidden', 'true')
    .text('fiber_manual_record');

  configurationButton
    .append('div')
    .attr('class', 'mat-button-ripple mat-ripple mat-button-ripple-round')
    .attr('ng-reflect-centered', 'true')
    .attr('ng-reflect-disabled', 'false')
    .attr('ng-reflect-trigger', '[object HTMLButtonElement]');

  configurationButton
    .append('div')
    .attr('class', 'mat-button-focus-overlay');








  const selectionButton = provenanceTreeVisualization.container
    .append('button')
    .attr('class', 'mat-icon-button mat-button-base mat-primary')
    .attr('color', 'primary')
    .attr('style', 'position: absolute; z-index: 1; top: 51%;')
    .attr('ng-reflect-color', 'primary')
    .on('mousedown', () => {
      var filters: any[] = [];
      if (sel === true) {
        selectionButton.attr('class', 'mat-icon-button mat-button-base mat-primary checked');
        sel = false;
      } else {
        selectionButton.attr('class', 'mat-icon-button mat-button-base mat-primary');
        sel = true;
      }
      if (der) {
        filters.push(filterObjects.find(x => x.name === 'derivation'))
      }
      if (ann) {
        filters.push(filterObjects.find(x => x.name === 'annotation'))
      }
      if (expl) {
        filters.push(filterObjects.find(x => x.name === 'exploration'))
      }
      if (sel) {
        filters.push(filterObjects.find(x => x.name === 'selection'))
      }
      if (prov) {
        filters.push(filterObjects.find(x => x.name === 'provenance'))
      }
      if (conf) {
        filters.push(filterObjects.find(x => x.name === 'configuration'))
      }

      provenanceTreeVisualization.filter = filters;
      provenanceTreeVisualization.update();
      provenanceTreeVisualization.scaleToFit();
    });

  selectionButton
    .append('span')
    .attr('class', 'mat-button-wrapper')
    .append('mat-icon')
    .attr('id', 'selection-trigger')
    .attr('class', 'mat-icon notranslate material-icons mat-icon-no-color')
    .attr('role', 'img')
    .attr('aria-hidden', 'true')
    .text('fiber_manual_record');

  selectionButton
    .append('div')
    .attr('class', 'mat-button-ripple mat-ripple mat-button-ripple-round')
    .attr('ng-reflect-centered', 'true')
    .attr('ng-reflect-disabled', 'false')
    .attr('ng-reflect-trigger', '[object HTMLButtonElement]');

  selectionButton
    .append('div')
    .attr('class', 'mat-button-focus-overlay');












  const annotationButton = provenanceTreeVisualization.container
    .append('button')
    .attr('class', 'mat-icon-button mat-button-base mat-primary')
    .attr('color', 'primary')
    .attr('style', 'position: absolute; z-index: 1; top: 54%;')
    .attr('ng-reflect-color', 'primary')
    .on('mousedown', () => {
      var filters: any[] = [];
      if (ann === true) {
        annotationButton.attr('class', 'mat-icon-button mat-button-base mat-primary checked');
        ann = false;
      } else {
        annotationButton.attr('class', 'mat-icon-button mat-button-base mat-primary');
        ann = true;
      }
      if (der) {
        filters.push(filterObjects.find(x => x.name === 'derivation'))
      }
      if (ann) {
        filters.push(filterObjects.find(x => x.name === 'annotation'))
      }
      if (expl) {
        filters.push(filterObjects.find(x => x.name === 'exploration'))
      }
      if (sel) {
        filters.push(filterObjects.find(x => x.name === 'selection'))
      }
      if (prov) {
        filters.push(filterObjects.find(x => x.name === 'provenance'))
      }
      if (conf) {
        filters.push(filterObjects.find(x => x.name === 'configuration'))
      }

      provenanceTreeVisualization.filter = filters;
      provenanceTreeVisualization.update();
      provenanceTreeVisualization.scaleToFit();
    });

  annotationButton
    .append('span')
    .attr('class', 'mat-button-wrapper')
    .append('mat-icon')
    .attr('id', 'annotation-trigger')
    .attr('class', 'mat-icon notranslate material-icons mat-icon-no-color')
    .attr('role', 'img')
    .attr('aria-hidden', 'true')
    .text('fiber_manual_record');

  annotationButton
    .append('div')
    .attr('class', 'mat-button-ripple mat-ripple mat-button-ripple-round')
    .attr('ng-reflect-centered', 'true')
    .attr('ng-reflect-disabled', 'false')
    .attr('ng-reflect-trigger', '[object HTMLButtonElement]');

  annotationButton
    .append('div')
    .attr('class', 'mat-button-focus-overlay');











  const provenanceButton = provenanceTreeVisualization.container
    .append('button')
    .attr('class', 'mat-icon-button mat-button-base mat-primary')
    .attr('color', 'primary')
    .attr('style', 'position: absolute; z-index: 1; top: 57%;')
    .attr('ng-reflect-color', 'primary')
    .on('mousedown', () => {
      var filters: any[] = [];
      if (prov === true) {
        provenanceButton.attr('class', 'mat-icon-button mat-button-base mat-primary checked');
        prov = false;
      } else {
        provenanceButton.attr('class', 'mat-icon-button mat-button-base mat-primary');
        prov = true;
      }
      if (der) {
        filters.push(filterObjects.find(x => x.name === 'derivation'))
      }
      if (ann) {
        filters.push(filterObjects.find(x => x.name === 'annotation'))
      }
      if (expl) {
        filters.push(filterObjects.find(x => x.name === 'exploration'))
      }
      if (sel) {
        filters.push(filterObjects.find(x => x.name === 'selection'))
      }
      if (prov) {
        filters.push(filterObjects.find(x => x.name === 'provenance'))
      }
      if (conf) {
        filters.push(filterObjects.find(x => x.name === 'configuration'))
      }

      provenanceTreeVisualization.filter = filters;
      provenanceTreeVisualization.update();
      provenanceTreeVisualization.scaleToFit();
    });

  provenanceButton
    .append('span')
    .attr('class', 'mat-button-wrapper')
    .append('mat-icon')
    .attr('id', 'provenance-trigger')
    .attr('class', 'mat-icon notranslate material-icons mat-icon-no-color')
    .attr('role', 'img')
    .attr('aria-hidden', 'true')
    .text('fiber_manual_record');

  provenanceButton
    .append('div')
    .attr('class', 'mat-button-ripple mat-ripple mat-button-ripple-round')
    .attr('ng-reflect-centered', 'true')
    .attr('ng-reflect-disabled', 'false')
    .attr('ng-reflect-trigger', '[object HTMLButtonElement]');

  provenanceButton
    .append('div')
    .attr('class', 'mat-button-focus-overlay');







    // const bookmarkButton = provenanceTreeVisualization.container
    // .append('button')
    // .attr('class', 'mat-icon-button mat-button-base mat-primary')
    // .attr('color', 'primary')
    // .attr('style', 'position: absolute; z-index: 1; top: 57%;')
    // .attr('ng-reflect-color', 'primary')
    // .on('mousedown', () => {
    //   var filters: any[] = [];
    //   if (prov === true) {
    //     bookmarkButton.attr('class', 'mat-icon-button mat-button-base mat-primary checked');
    //     prov = false;
    //   } else {
    //     bookmarkButton.attr('class', 'mat-icon-button mat-button-base mat-primary');
    //     prov = true;
    //   }
    //   if (der) {
    //     filters.push(filterObjects.find(x => x.name === 'derivation'))
    //   }
    //   if (ann) {
    //     filters.push(filterObjects.find(x => x.name === 'annotation'))
    //   }
    //   if (expl) {
    //     filters.push(filterObjects.find(x => x.name === 'exploration'))
    //   }
    //   if (sel) {
    //     filters.push(filterObjects.find(x => x.name === 'selection'))
    //   }
    //   if (prov) {
    //     filters.push(filterObjects.find(x => x.name === 'provenance'))
    //   }
    //   if (conf) {
    //     filters.push(filterObjects.find(x => x.name === 'configuration'))
    //   }

    //   provenanceTreeVisualization.filter = filters;
    //   provenanceTreeVisualization.update();
    //   provenanceTreeVisualization.scaleToFit();
    // });

    // bookmarkButton
    // .append('span')
    // .attr('class', 'mat-button-wrapper')
    // .append('mat-icon')
    // .attr('id', 'provenance-trigger')
    // .attr('class', 'mat-icon notranslate material-icons mat-icon-no-color')
    // .attr('role', 'img')
    // .attr('aria-hidden', 'true')
    // .text('fiber_manual_record');

    // bookmarkButton
    // .append('div')
    // .attr('class', 'mat-button-ripple mat-ripple mat-button-ripple-round')
    // .attr('ng-reflect-centered', 'true')
    // .attr('ng-reflect-disabled', 'false')
    // .attr('ng-reflect-trigger', '[object HTMLButtonElement]');

    // bookmarkButton
    // .append('div')
    // .attr('class', 'mat-button-focus-overlay');








  // legendButton

  const legendButton = provenanceTreeVisualization.container
    .append('button')
    .attr('id', 'legend-trigger')
    .attr('class', 'mat-icon-button mat-button-base mat-primary')
    .attr('color', 'primary')
    .attr('style', 'position: absolute; color: orange; z-index: 1; background-color: snow; top: 68%; right: 2%;')
    .attr('ng-reflect-color', 'primary')
    .on('mousedown', () => {
      const visible = d3.select("#legendContainer").style('display') === 'none';
      if (visible) {
        legendButton.attr('class', 'mat-icon-button mat-button-base mat-primary checked');
        d3.select("#legendContainer").attr('style', 'display: block; z-index: 11;');
        d3.select("#commandsContainer").attr('style', 'display: block; z-index: 11;');
        holder.style('display', 'none');
        holder.style('justify-content', 'end');
        provenanceTreeVisualization.minimap.container.style('display', 'none');
        activeNodeButton.style('display', 'none');
        activeNodeButton.style('display', 'end');
        provenanceTreeVisualization.container.style('height', '100%');
        provenanceTreeVisualization.update();
        provenanceTreeVisualization.scaleToFit();
      } else {
        legendButton.attr('class', 'mat-icon-button mat-button-base mat-primary');
        d3.select("#legendContainer").attr('style', 'display: none;');
        d3.select("#commandsContainer").attr('style', 'display: none;');
        provenanceTreeVisualization.minimap.container.style('display', 'block');
        holder.style('display', 'flex');
        holder.style('justify-content', 'space-evenly');
        activeNodeButton.style('display', '');
        activeNodeButton.style('display', 'block');
        provenanceTreeVisualization.container.style('height', '70%');
        provenanceTreeVisualization.update();
        provenanceTreeVisualization.scaleToFit();
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



  // settingsButton

  // const settingsButton = provenanceTreeVisualization.container
  //   .append('button')
  //   .attr('id', 'setting-trigger')
  //   .attr('class', 'mat-icon-button mat-button-base mat-primary')
  //   .attr('color', 'primary')
  //   .attr('style', 'position: absolute; color: orange; z-index: 1; background-color: snow; top: 63%;')
  //   .attr('ng-reflect-color', 'primary')
  //   .on('mousedown', () => {
  //     const visible = holder.style('display') === 'flex';
  //     if (visible) {
  //       settingsButton.attr('class', 'mat-icon-button mat-button-base mat-primary checked');
  //       holder.style('display', 'none');
  //       holder.style('justify-content', 'end');
  //       provenanceTreeVisualization.update();
  //       provenanceTreeVisualization.scaleToFit();
  //     } else {
  //       settingsButton.attr('class', 'mat-icon-button mat-button-base mat-primary');
  //       holder.style('display', 'flex');
  //       holder.style('justify-content', 'space-evenly');
  //       provenanceTreeVisualization.update();
  //       provenanceTreeVisualization.scaleToFit();
  //     }
  //   });

  // settingsButton
  //   .append('span')
  //   .attr('class', 'mat-button-wrapper')
  //   .append('mat-icon')
  //   .attr('class', 'mat-icon notranslate material-icons mat-icon-no-color')
  //   .attr('role', 'img')
  //   .attr('aria-hidden', 'true')
  //   .text('settings');

  // settingsButton
  //   .append('div')
  //   .attr('class', 'mat-button-ripple mat-ripple mat-button-ripple-round')
  //   .attr('ng-reflect-centered', 'true')
  //   .attr('ng-reflect-disabled', 'false')
  //   .attr('ng-reflect-trigger', '[object HTMLButtonElement]');

  // settingsButton
  //   .append('div')
  //   .attr('class', 'mat-button-focus-overlay');





  const minimapButton = provenanceTreeVisualization.container
    .append('button')
    .attr('id', 'minimap-trigger')
    .attr('class', 'mat-icon-button mat-button-base mat-primary')
    .attr('color', 'primary')
    .attr('style', 'position: absolute; color: orange; z-index: 1; background-color: snow; top: 71%; right: 2%;')
    .attr('ng-reflect-color', 'primary')
    .on('mousedown', () => {
      const visible = provenanceTreeVisualization.minimap.container.style('display') === 'block';
      if (visible) {
        minimapButton.attr('class', 'mat-icon-button mat-button-base mat-primary checked');
        activeNodeButton.style('display', 'none');
        provenanceTreeVisualization.minimap.container.style('display', 'none');
        provenanceTreeVisualization.container.style('height', '100%');
        provenanceTreeVisualization.update();
        provenanceTreeVisualization.scaleToFit();
      } else {
        minimapButton.attr('class', 'mat-icon-button mat-button-base mat-primary');
        activeNodeButton.style('display', 'block');
        provenanceTreeVisualization.minimap.container.style('display', 'block');
        provenanceTreeVisualization.container.style('height', '70%');
        provenanceTreeVisualization.update();
        provenanceTreeVisualization.scaleToFit();
      }
    });

  minimapButton
    .append('span')
    .attr('class', 'mat-button-wrapper')
    .append('mat-icon')
    .attr('class', 'mat-icon notranslate material-icons mat-icon-no-color')
    .attr('role', 'img')
    .attr('aria-hidden', 'true')
    .text('map');

  minimapButton
    .append('div')
    .attr('class', 'mat-button-ripple mat-ripple mat-button-ripple-round')
    .attr('ng-reflect-centered', 'true')
    .attr('ng-reflect-disabled', 'false')
    .attr('ng-reflect-trigger', '[object HTMLButtonElement]');

  minimapButton
    .append('div')
    .attr('class', 'mat-button-focus-overlay');




  

















  const activeNodeButton = provenanceTreeVisualization.minimap ? provenanceTreeVisualization.minimap.container : provenanceTreeVisualization.container
    .append('button')
    .attr('id', 'activenode-trigger')
    .attr('class', 'mat-icon-button mat-button-base mat-primary')
    .attr('color', 'primary')
    .attr('style', 'position: absolute; color: dodgerblue; z-index: 1; background-color: snow; bottom: 1%')
    .attr('ng-reflect-color', 'primary')
    .on('mousedown', () => {
      const visible = provenanceTreeVisualization.minimap.followActiveNode === false;
      if (visible) {
        activeNodeButton.attr('class', 'mat-icon-button mat-button-base mat-primary checked');
        provenanceTreeVisualization.minimap.followActiveNode = !provenanceTreeVisualization.minimap.followActiveNode;
        provenanceTreeVisualization.update();
        provenanceTreeVisualization.scaleToFit();
      } else {
        activeNodeButton.attr('class', 'mat-icon-button mat-button-base mat-primary');
        provenanceTreeVisualization.minimap.followActiveNode = !provenanceTreeVisualization.minimap.followActiveNode;
        provenanceTreeVisualization.update();
        provenanceTreeVisualization.scaleToFit();
      }
    });

  activeNodeButton
    .append('span')
    .attr('class', 'mat-button-wrapper')
    .append('mat-icon')
    .attr('class', 'mat-icon notranslate material-icons mat-icon-no-color')
    .attr('role', 'img')
    .attr('aria-hidden', 'true')
    .text('filter_center_focus');

  activeNodeButton
    .append('div')
    .attr('class', 'mat-button-ripple mat-ripple mat-button-ripple-round')
    .attr('ng-reflect-centered', 'true')
    .attr('ng-reflect-disabled', 'false')
    .attr('ng-reflect-trigger', '[object HTMLButtonElement]');

  activeNodeButton
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
  // const currentValue = container.append('span').text(0);

  slider.on('change', () => {
    const val = parseInt(slider.node()!.value, 10);
    // currentValue.text(val);
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
