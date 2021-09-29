import * as d3 from 'd3';
import {
  aggregationObjects,
  aggregationObjectsUI1,
  aggregationObjectsUI2,
  wrapNode,
  bookmarker,
  rawData
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

  const container = provenanceTreeVisualization.container.append('div').attr('id', 'buttonsContainer');
  const holder = container.append('div').attr('class', 'holder').attr('id', 'holderDiv').attr('style', 'display: contents;');

  // Data aggregation Div
  const dataDiv = holder.append('div').attr('class', 'controlsBox').attr('style', 'z-index: 1; position: absolute; top: 61%;');

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
      // provenanceTreeVisualization.scaleToFit();
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
    // provenanceTreeVisualization.scaleToFit();
  });

  // const holder = container.append('div');
  addLegend(provenanceTreeVisualization.container);
  addCommandsList(provenanceTreeVisualization.container);
  addtasksList(provenanceTreeVisualization.container);










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



  const upwardButton = container
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

  var tooltip1 = d3.select("#upward-trigger")
    .append("div")
    .style("position", "absolute")
    .style("left", "30px")
    .style("top", "0px")
    .style("border", "solid")
    .style("border-width", "1px")
    .style("border-radius", "5px")
    .style("padding", "5px").style("visibility", "hidden")
    .text("Previous node");


  d3.select("#upward-trigger")
    .on("mouseover", function () { return tooltip1.style("visibility", "visible"); })
    .on("mouseout", function () { return tooltip1.style("visibility", "hidden"); });





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


  const downwardButton = container
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

  var tooltip2 = d3.select("#downward-trigger")
    .append("div")
    .style("position", "absolute")
    .style("left", "30px")
    .style("top", "0px")
    .style("border", "solid")
    .style("border-width", "1px")
    .style("border-radius", "5px")
    .style("padding", "5px").style("visibility", "hidden")
    .text("Next node");


  d3.select("#downward-trigger")
    .on("mouseover", function () { return tooltip2.style("visibility", "visible"); })
    .on("mouseout", function () { return tooltip2.style("visibility", "hidden"); });







  const newAnalysisButton = container
    .append('button')
    .attr('id', 'newAnalysis-trigger')
    .attr('class', 'mat-icon-button mat-button-base mat-primary')
    .attr('color', 'primary')
    .attr('style', 'position: absolute; z-index: 1; top: 8%;')
    .attr('ng-reflect-color', 'primary')
    .on('contextmenu', () => { (window as any).canvas.provenance.generation(true); })
    .on('click', () => { (window as any).canvas.provenance.generation(); });

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

  var tooltip3 = d3.select("#newAnalysis-trigger")
    .append("div")
    .style("position", "absolute")
    .style("left", "30px")
    .style("top", "0px")
    .style("border", "solid")
    .style("border-width", "1px")
    .style("border-radius", "5px")
    .style("padding", "5px").style("visibility", "hidden")
    .text("New analysis");


  d3.select("#newAnalysis-trigger")
    .on("mouseover", function () { return tooltip3.style("visibility", "visible"); })
    .on("mouseout", function () { return tooltip3.style("visibility", "hidden"); });






  const newAnalysisFromCurrentNodeButton = container
    .append('button')
    .attr('id', 'newAnalysisFromCurrentNode-trigger')
    .attr('class', 'mat-icon-button mat-button-base mat-primary')
    .attr('color', 'primary')
    .attr('style', 'position: absolute; z-index: 1; top: 11%;')
    .attr('ng-reflect-color', 'primary')
    .on('click', () => { (window as any).canvas.provenance.fission(); })


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

  var tooltip4 = d3.select("#newAnalysisFromCurrentNode-trigger")
    .append("div")
    .style("position", "absolute")
    .style("left", "30px")
    .style("top", "0px")
    .style("border", "solid")
    .style("border-width", "1px")
    .style("border-radius", "5px")
    .style("padding", "5px").style("visibility", "hidden")
    .text("New analysis from current node");


  d3.select("#newAnalysisFromCurrentNode-trigger")
    .on("mouseover", function () { return tooltip4.style("visibility", "visible"); })
    .on("mouseout", function () { return tooltip4.style("visibility", "hidden"); });



  const splittingButton = container
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

  var tooltip5 = d3.select("#splitting-trigger")
    .append("div")
    .style("position", "absolute")
    .style("left", "30px")
    .style("top", "0px")
    .style("border", "solid")
    .style("border-width", "1px")
    .style("border-radius", "5px")
    .style("padding", "5px").style("visibility", "hidden")
    .text("Node splitting");


  d3.select("#splitting-trigger")
    .on("mouseover", function () { return tooltip5.style("visibility", "visible"); })
    .on("mouseout", function () { return tooltip5.style("visibility", "hidden"); });








  const transferringButton = container
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

  var tooltip6 = d3.select("#transferring-trigger")
    .append("div")
    .style("position", "absolute")
    .style("left", "30px")
    .style("top", "0px")
    .style("border", "solid")
    .style("border-width", "1px")
    .style("border-radius", "5px")
    .style("padding", "5px").style("visibility", "hidden")
    .text("Node transferring");


  d3.select("#transferring-trigger")
    .on("mouseover", function () { return tooltip6.style("visibility", "visible"); })
    .on("mouseout", function () { return tooltip6.style("visibility", "hidden"); });










  const mergingButton = container
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

  var tooltip7 = d3.select("#merging-trigger")
    .append("div")
    .style("position", "absolute")
    .style("left", "30px")
    .style("top", "0px")
    .style("border", "solid")
    .style("border-width", "1px")
    .style("border-radius", "5px")
    .style("padding", "5px").style("visibility", "hidden")
    .text("Node merging");


  d3.select("#merging-trigger")
    .on("mouseover", function () { return tooltip7.style("visibility", "visible"); })
    .on("mouseout", function () { return tooltip7.style("visibility", "hidden"); });










  const copyingButton = container
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

  var tooltip8 = d3.select("#copying-trigger")
    .append("div")
    .style("position", "absolute")
    .style("left", "30px")
    .style("top", "0px")
    .style("border", "solid")
    .style("border-width", "1px")
    .style("border-radius", "5px")
    .style("padding", "5px").style("visibility", "hidden")
    .text("Node copying");


  d3.select("#copying-trigger")
    .on("mouseover", function () { return tooltip8.style("visibility", "visible"); })
    .on("mouseout", function () { return tooltip8.style("visibility", "hidden"); });








  const caterpillarButton = container
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
      } else {
        caterpillarButton.attr('class', 'mat-icon-button mat-button-base mat-primary');
        provenanceTreeVisualization.caterpillarActivated = !provenanceTreeVisualization.caterpillarActivated;
        provenanceTreeVisualization.update();
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

  var tooltip9 = d3.select("#caterpillar-trigger")
    .append("div")
    .style("position", "absolute")
    .style("left", "30px")
    .style("top", "0px")
    .style("border", "solid")
    .style("border-width", "1px")
    .style("border-radius", "5px")
    .style("padding", "5px").style("visibility", "hidden")
    .text("Caterpillar mode");


  d3.select("#caterpillar-trigger")
    .on("mouseover", function () { return tooltip9.style("visibility", "visible"); })
    .on("mouseout", function () { return tooltip9.style("visibility", "hidden"); });



  const elasticTreeButton = container
    .append('button')
    .attr('id', 'elasticTree-trigger')
    .attr('class', 'mat-icon-button mat-button-base mat-primary')
    .attr('color', 'primary')
    .attr('style', 'position: absolute; color: darkcyan; z-index: 1; top: 31%;')
    .attr('ng-reflect-color', 'primary')
    .on('mousedown', () => {
      if (provenanceTreeVisualization.elasticTreeLayoutActivated === false) {
        elasticTreeButton.attr('class', 'mat-icon-button mat-button-base mat-primary checked');
        provenanceTreeVisualization.elasticTreeLayoutActivated = !provenanceTreeVisualization.elasticTreeLayoutActivated;
        provenanceTreeVisualization.update();
      } else {
        elasticTreeButton.attr('class', 'mat-icon-button mat-button-base mat-primary');
        provenanceTreeVisualization.elasticTreeLayoutActivated = !provenanceTreeVisualization.elasticTreeLayoutActivated;
        provenanceTreeVisualization.update();
      }
    });



  elasticTreeButton
    .append('span')
    .attr('class', 'mat-button-wrapper')
    .append('mat-icon')
    .attr('class', 'mat-icon notranslate material-icons mat-icon-no-color')
    .attr('role', 'img')
    .attr('aria-hidden', 'true')
    .text('unfold_less');

  elasticTreeButton
    .append('div')
    .attr('class', 'mat-button-ripple mat-ripple mat-button-ripple-round')
    .attr('ng-reflect-centered', 'true')
    .attr('ng-reflect-disabled', 'false')
    .attr('ng-reflect-trigger', '[object HTMLButtonElement]');

  elasticTreeButton
    .append('div')
    .attr('class', 'mat-button-focus-overlay');

  var tooltip10 = d3.select("#elasticTree-trigger")
    .append("div")
    .style("position", "absolute")
    .style("left", "30px")
    .style("top", "0px")
    .style("border", "solid")
    .style("border-width", "1px")
    .style("border-radius", "5px")
    .style("padding", "5px").style("visibility", "hidden")
    .text("Elastic tree mode");


  d3.select("#elasticTree-trigger")
    .on("mouseover", function () { return tooltip10.style("visibility", "visible"); })
    .on("mouseout", function () { return tooltip10.style("visibility", "hidden"); });


  const storyTreeButton = container
    .append('button')
    .attr('id', 'storyTree-trigger')
    .attr('class', 'mat-icon-button mat-button-base mat-primary')
    .attr('color', 'primary')
    .attr('style', 'position: absolute; color: darkcyan; z-index: 1; top: 34%;')
    .attr('ng-reflect-color', 'primary')
    .on('mousedown', () => {
      if (provenanceTreeVisualization.storyOrderLayoutActivated === false) {
        storyTreeButton.attr('class', 'mat-icon-button mat-button-base mat-primary checked');
        provenanceTreeVisualization.storyOrderLayoutActivated = !provenanceTreeVisualization.storyOrderLayoutActivated;
        provenanceTreeVisualization.aggregation.aggregator = bookmarker;
        provenanceTreeVisualization.update();
      } else {
        storyTreeButton.attr('class', 'mat-icon-button mat-button-base mat-primary');
        provenanceTreeVisualization.storyOrderLayoutActivated = !provenanceTreeVisualization.storyOrderLayoutActivated;
        provenanceTreeVisualization.aggregation.aggregator = rawData;
        provenanceTreeVisualization.update();
      }
    });

  storyTreeButton
    .append('span')
    .attr('class', 'mat-button-wrapper')
    .append('mat-icon')
    .attr('class', 'mat-icon notranslate material-icons mat-icon-no-color')
    .attr('role', 'img')
    .attr('aria-hidden', 'true')
    .text('gesture');

  storyTreeButton
    .append('div')
    .attr('class', 'mat-button-ripple mat-ripple mat-button-ripple-round')
    .attr('ng-reflect-centered', 'true')
    .attr('ng-reflect-disabled', 'false')
    .attr('ng-reflect-trigger', '[object HTMLButtonElement]');

  storyTreeButton
    .append('div')
    .attr('class', 'mat-button-focus-overlay');

  var tooltip11 = d3.select("#storyTree-trigger")
    .append("div")
    .style("position", "absolute")
    .style("left", "30px")
    .style("top", "0px")
    .style("border", "solid")
    .style("border-width", "1px")
    .style("border-radius", "5px")
    .style("padding", "5px").style("visibility", "hidden")
    .text("Story tree mode");


  d3.select("#storyTree-trigger")
    .on("mouseover", function () { return tooltip11.style("visibility", "visible"); })
    .on("mouseout", function () { return tooltip11.style("visibility", "hidden"); });








  const autoScalingButton = container
    .append('button')
    .attr('id', 'autoScaling-trigger')
    .attr('class', 'mat-icon-button mat-button-base mat-primary')
    .attr('color', 'primary')
    .attr('style', 'position: absolute; color: darkcyan; z-index: 1; top: 37%;')
    .attr('ng-reflect-color', 'primary')
    .on('mousedown', () => {
      if (provenanceTreeVisualization.autoScaling === false) {
        autoScalingButton.attr('class', 'mat-icon-button mat-button-base mat-primary checked');
        provenanceTreeVisualization.autoScaling = !provenanceTreeVisualization.autoScaling;
      } else {
        autoScalingButton.attr('class', 'mat-icon-button mat-button-base mat-primary');
        provenanceTreeVisualization.autoScaling = !provenanceTreeVisualization.autoScaling;
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

  var tooltip12 = d3.select("#autoScaling-trigger")
    .append("div")
    .style("position", "absolute")
    .style("left", "30px")
    .style("top", "0px")
    .style("border", "solid")
    .style("border-width", "1px")
    .style("border-radius", "5px")
    .style("padding", "5px").style("visibility", "hidden")
    .text("Autoscaling");


  d3.select("#autoScaling-trigger")
    .on("mouseover", function () { return tooltip12.style("visibility", "visible"); })
    .on("mouseout", function () { return tooltip12.style("visibility", "hidden"); });



  const activeNodeButton = container
    .append('button')
    .attr('id', 'activeNode-trigger')
    .attr('class', 'mat-icon-button mat-button-base mat-primary')
    .attr('color', 'primary')
    .attr('style', 'position: absolute; color: darkcyan; z-index: 1; top: 40%;')
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

  var tooltip13 = d3.select("#activeNode-trigger")
    .append("div")
    .style("position", "absolute")
    .style("left", "30px")
    .style("top", "0px")
    .style("border", "solid")
    .style("border-width", "1px")
    .style("border-radius", "5px")
    .style("padding", "5px").style("visibility", "hidden")
    .text("Active node centering");


  d3.select("#activeNode-trigger")
    .on("mouseover", function () { return tooltip13.style("visibility", "visible"); })
    .on("mouseout", function () { return tooltip13.style("visibility", "hidden"); });




  const derivationButton = container
    .append('button')
    .attr('id', 'derivation-trigger')
    .attr('class', 'mat-icon-button mat-button-base mat-primary')
    .attr('color', 'primary')
    .attr('style', 'position: absolute; z-index: 1; top: 44%;')
    .attr('ng-reflect-color', 'primary')
    .on('mousedown', () => {
      var filters: any[] = [];
      if (der === false) {
        derivationButton.attr('class', 'mat-icon-button mat-button-base mat-primary');
        der = true;
      } else {
        derivationButton.attr('class', 'mat-icon-button mat-button-base mat-primary checked');
        der = false;
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
    });

  derivationButton
    .append('span')
    .attr('class', 'mat-button-wrapper')
    .append('mat-icon')
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

  var tooltip14 = d3.select("#derivation-trigger")
    .append("div")
    .style("position", "absolute")
    .style("left", "30px")
    .style("top", "0px")
    .style("border", "solid")
    .style("border-width", "1px")
    .style("border-radius", "5px")
    .style("padding", "5px").style("visibility", "hidden")
    .text("Derivation");


  d3.select("#derivation-trigger")
    .on("mouseover", function () { return tooltip14.style("visibility", "visible"); })
    .on("mouseout", function () { return tooltip14.style("visibility", "hidden"); });





  const explorationButton = container
    .append('button')
    .attr('id', 'exploration-trigger')
    .attr('class', 'mat-icon-button mat-button-base mat-primary')
    .attr('color', 'primary')
    .attr('style', 'position: absolute; z-index: 1; top: 46%;')
    .attr('ng-reflect-color', 'primary')
    .on('mousedown', () => {
      var filters: any[] = [];
      if (expl === false) {
        explorationButton.attr('class', 'mat-icon-button mat-button-base mat-primary');
        expl = true;
      } else {
        explorationButton.attr('class', 'mat-icon-button mat-button-base mat-primary checked');
        expl = false;
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
    });

  explorationButton
    .append('span')
    .attr('class', 'mat-button-wrapper')
    .append('mat-icon')
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

  var tooltip15 = d3.select("#exploration-trigger")
    .append("div")
    .style("position", "absolute")
    .style("left", "30px")
    .style("top", "0px")
    .style("border", "solid")
    .style("border-width", "1px")
    .style("border-radius", "5px")
    .style("padding", "5px").style("visibility", "hidden")
    .text("Exploration");


  d3.select("#exploration-trigger")
    .on("mouseover", function () { return tooltip15.style("visibility", "visible"); })
    .on("mouseout", function () { return tooltip15.style("visibility", "hidden"); });



  const configurationButton = container
    .append('button')
    .attr('id', 'configuration-trigger')
    .attr('class', 'mat-icon-button mat-button-base mat-primary')
    .attr('color', 'primary')
    .attr('style', 'position: absolute; z-index: 1; top: 48%;')
    .attr('ng-reflect-color', 'primary')
    .on('mousedown', () => {
      var filters: any[] = [];
      if (conf === false) {
        configurationButton.attr('class', 'mat-icon-button mat-button-base mat-primary');
        conf = true;
      } else {
        configurationButton.attr('class', 'mat-icon-button mat-button-base mat-primary checked');
        conf = false;
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
    });

  configurationButton
    .append('span')
    .attr('class', 'mat-button-wrapper')
    .append('mat-icon')
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

  var tooltip16 = d3.select("#configuration-trigger")
    .append("div")
    .style("position", "absolute")
    .style("left", "30px")
    .style("top", "0px")
    .style("border", "solid")
    .style("border-width", "1px")
    .style("border-radius", "5px")
    .style("padding", "5px").style("visibility", "hidden")
    .text("Configuration");


  d3.select("#configuration-trigger")
    .on("mouseover", function () { return tooltip16.style("visibility", "visible"); })
    .on("mouseout", function () { return tooltip16.style("visibility", "hidden"); });






  const selectionButton = container
    .append('button')
    .attr('id', 'selection-trigger')
    .attr('class', 'mat-icon-button mat-button-base mat-primary')
    .attr('color', 'primary')
    .attr('style', 'position: absolute; z-index: 1; top: 50%;')
    .attr('ng-reflect-color', 'primary')
    .on('mousedown', () => {
      var filters: any[] = [];
      if (sel === false) {
        selectionButton.attr('class', 'mat-icon-button mat-button-base mat-primary');
        sel = true;
      } else {
        selectionButton.attr('class', 'mat-icon-button mat-button-base mat-primary checked');
        sel = false;
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
    });

  selectionButton
    .append('span')
    .attr('class', 'mat-button-wrapper')
    .append('mat-icon')
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

  var tooltip17 = d3.select("#selection-trigger")
    .append("div")
    .style("position", "absolute")
    .style("left", "30px")
    .style("top", "0px")
    .style("border", "solid")
    .style("border-width", "1px")
    .style("border-radius", "5px")
    .style("padding", "5px").style("visibility", "hidden")
    .text("Selection");


  d3.select("#selection-trigger")
    .on("mouseover", function () { return tooltip17.style("visibility", "visible"); })
    .on("mouseout", function () { return tooltip17.style("visibility", "hidden"); });










  const annotationButton = container
    .append('button')
    .attr('id', 'annotation-trigger')
    .attr('class', 'mat-icon-button mat-button-base mat-primary')
    .attr('color', 'primary')
    .attr('style', 'position: absolute; z-index: 1; top: 52%;')
    .attr('ng-reflect-color', 'primary')
    .on('mousedown', () => {
      var filters: any[] = [];
      if (ann === false) {
        annotationButton.attr('class', 'mat-icon-button mat-button-base mat-primary');
        ann = true;
      } else {
        annotationButton.attr('class', 'mat-icon-button mat-button-base mat-primary checked');
        ann = false;
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
    });

  annotationButton
    .append('span')
    .attr('class', 'mat-button-wrapper')
    .append('mat-icon')
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


  var tooltip18 = d3.select("#annotation-trigger")
    .append("div")
    .style("position", "absolute")
    .style("left", "30px")
    .style("top", "0px")
    .style("border", "solid")
    .style("border-width", "1px")
    .style("border-radius", "5px")
    .style("padding", "5px").style("visibility", "hidden")
    .text("Annotation");


  d3.select("#annotation-trigger")
    .on("mouseover", function () { return tooltip18.style("visibility", "visible"); })
    .on("mouseout", function () { return tooltip18.style("visibility", "hidden"); });








  const provenanceButton = container
    .append('button')
    .attr('id', 'provenance-trigger')
    .attr('class', 'mat-icon-button mat-button-base mat-primary')
    .attr('color', 'primary')
    .attr('style', 'position: absolute; z-index: 1; top: 54%;')
    .attr('ng-reflect-color', 'primary')
    .on('mousedown', () => {
      var filters: any[] = [];
      if (prov === false) {
        provenanceButton.attr('class', 'mat-icon-button mat-button-base mat-primary');
        prov = true;
      } else {
        provenanceButton.attr('class', 'mat-icon-button mat-button-base mat-primary checked');
        prov = false;
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
    });

  provenanceButton
    .append('span')
    .attr('class', 'mat-button-wrapper')
    .append('mat-icon')
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

  var tooltip19 = d3.select("#provenance-trigger")
    .append("div")
    .style("position", "absolute")
    .style("left", "30px")
    .style("top", "0px")
    .style("border", "solid")
    .style("border-width", "1px")
    .style("border-radius", "5px")
    .style("padding", "5px").style("visibility", "hidden")
    .text("Provenance");


  d3.select("#provenance-trigger")
    .on("mouseover", function () { return tooltip19.style("visibility", "visible"); })
    .on("mouseout", function () { return tooltip19.style("visibility", "hidden"); });





  const saveGraphButton = container
    .append('button')
    .attr('id', 'saveGraph-trigger')
    .attr('class', 'mat-icon-button mat-button-base mat-primary')
    .attr('color', 'primary')
    .attr('style', 'position: absolute; z-index: 1; color: firebrick; top: 68%;')
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

  var tooltip20 = d3.select("#saveGraph-trigger")
    .append("div")
    .style("position", "absolute")
    .style("left", "30px")
    .style("top", "0px")
    .style("border", "solid")
    .style("border-width", "1px")
    .style("border-radius", "5px")
    .style("padding", "5px").style("visibility", "hidden")
    .text("Save graph");


  d3.select("#saveGraph-trigger")
    .on("mouseover", function () { return tooltip20.style("visibility", "visible"); })
    .on("mouseout", function () { return tooltip20.style("visibility", "hidden"); });



  const saveStoryButton = container
    .append('button')
    .attr('id', 'savesStory-trigger')
    .attr('class', 'mat-icon-button mat-button-base mat-primary')
    .attr('color', 'primary')
    .attr('style', 'position: absolute; z-index: 1; color: firebrick; top: 71%;')
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

  var tooltip21 = d3.select("#savesStory-trigger")
    .append("div")
    .style("position", "absolute")
    .style("left", "30px")
    .style("top", "0px")
    .style("border", "solid")
    .style("border-width", "1px")
    .style("border-radius", "5px")
    .style("padding", "5px").style("visibility", "hidden")
    .text("Save story");


  d3.select("#savesStory-trigger")
    .on("mouseover", function () { return tooltip21.style("visibility", "visible"); })
    .on("mouseout", function () { return tooltip21.style("visibility", "hidden"); });


  // const bookmarkButton = container
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
    .attr('style', 'position: absolute; color: orange; z-index: 1; top: 74%;')
    .attr('ng-reflect-color', 'primary')
    .on('mousedown', () => {
      const visible = d3.select("#legendContainer").style('display') === 'none';
      const buttonsVisible = container.attr('class') === 'withButtons';
      if (visible) {
        if (buttonsVisible) {
          activeNodeButton.style('display', 'none');
        }
        minimapButton.style('display', 'none');
        legendButton.attr('class', 'mat-icon-button mat-button-base mat-primary checked').attr('style', 'bottom: 1%; color: orange;');
        d3.select("#legendContainer").attr('style', 'display: block; z-index: 11;');
        d3.select("#commandsContainer").attr('style', 'display: block; z-index: 11;');
        d3.select("#tasksContainer").attr('style', 'display: block; z-index: 11;');
        provenanceTreeVisualization.container.attr('style', 'height: 100%;');
        provenanceTreeVisualization.update();
      } else {
        if (buttonsVisible) {
          activeNodeButton.style('display', 'block');
        }
        minimapButton.style('display', 'block');
        legendButton.attr('class', 'mat-icon-button mat-button-base mat-primary').attr('style', 'position: absolute; color: orange; z-index: 1; top: 74%;');
        d3.select("#legendContainer").attr('style', 'display: none;');
        d3.select("#commandsContainer").attr('style', 'display: none;');
        d3.select("#tasksContainer").attr('style', 'display: none;');
        provenanceTreeVisualization.container.attr('style', 'height: 80%;');
        provenanceTreeVisualization.update();
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

  var tooltip22 = d3.select("#legend-trigger")
    .append("div")
    .style("position", "absolute")
    .style("left", "30px")
    .style("top", "0px")
    .style("border", "solid")
    .style("border-width", "1px")
    .style("border-radius", "5px")
    .style("padding", "5px").style("visibility", "hidden")
    .text("Legend");


  d3.select("#legend-trigger")
    .on("mouseover", function () { return tooltip22.style("visibility", "visible"); })
    .on("mouseout", function () { return tooltip22.style("visibility", "hidden"); });

  // settingsButton

  // const settingsButton = container
  //   .append('button')
  //   .attr('id', 'setting-trigger')
  //   .attr('class', 'mat-icon-button mat-button-base mat-primary')
  //   .attr('color', 'primary')
  //   .attr('style', 'position: absolute; color: orange; z-index: 1; top: 63%;')
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
    .attr('style', 'position: absolute; color: orange; z-index: 1; top: 77%;')
    .attr('ng-reflect-color', 'primary')
    .on('mousedown', () => {
      const visible = provenanceTreeVisualization.minimap.container.style('display') === 'none';
      if (visible) {
        minimapButton.attr('class', 'mat-icon-button mat-button-base mat-primary checked');
        provenanceTreeVisualization.minimap.container.style('display', 'block');
        container.style('height', '100%');
        provenanceTreeVisualization.update();
      } else {
        minimapButton.attr('class', 'mat-icon-button mat-button-base mat-primary');
        provenanceTreeVisualization.minimap.container.style('display', 'none');
        container.style('height', '80%');
        provenanceTreeVisualization.update();
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

  var tooltip23 = d3.select("#minimap-trigger")
    .append("div")
    .style("position", "absolute")
    .style("left", "30px")
    .style("top", "0px")
    .style("border", "solid")
    .style("border-width", "1px")
    .style("border-radius", "5px")
    .style("padding", "5px").style("visibility", "hidden")
    .text("Minimap view");


  d3.select("#minimap-trigger")
    .on("mouseover", function () { return tooltip23.style("visibility", "visible"); })
    .on("mouseout", function () { return tooltip23.style("visibility", "hidden"); });
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
