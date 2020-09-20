import { Component, Input, DoCheck, ViewChild } from '@angular/core';
import { BrainvisCanvasComponent } from '../../brainvis-canvas/brainvis-canvas.component';
import { Options } from 'ng5-slider';
import { Settings } from '../../brainvis-canvas/utils/settings';

@Component({
  selector: 'app-styled-slider',
  templateUrl: './styled-slider.component.html',
  styleUrls: ['./styled-slider.component.scss']
})


export class StyledSliderComponent 
// implements DoCheck 
{
  @Input() canvas: BrainvisCanvasComponent;
  @Input('studyStarted') studyStarted: boolean;

  public settings = Settings.getInstance(this);
  public valueW = this.settings._thresholdValueW;
  public valueC = this.settings._thresholdValueC;

  constructor() {
    (window as any).slider = this;
  }

  optionsW: Options = {
    floor: this.settings._thresholdLowerBoundW,
    ceil: this.settings._thresholdUpperBoundW,
    step: 1,
    showTicks: false
  };

  optionsC: Options = {
    floor: this.settings._thresholdLowerBoundC,
    ceil: this.settings._thresholdUpperBoundC,
    step: 1,
    showTicks: false
  };




  setValueC(value: number) {
    this.valueC = value;
  }

  setValueW(value: number) {
    this.valueW = value;
  }


  // get tickInterval(): number {
  //   return this._tickInterval;
  // }
  // set tickInterval(value) {
  //   this._tickInterval = value;
  // }
  // private _tickInterval = 1;

  // ngDoCheck() {

    // let changeDetectedW = false;
    // let changeDetectedC = false;

    // if (this.canvas.settings.thresholdLowerBoundW !== this.optionsW.floor) {
    //   changeDetectedW = true;
    // }

    // if (this.canvas.settings.thresholdUpperBoundW !== this.optionsW.ceil) {
    //   changeDetectedW = true;
    // }

    // if (changeDetectedW) {
    //   const newOptions: Options = Object.assign({}, this.optionsW);
    //   newOptions.floor = this.canvas.settings.thresholdLowerBoundW;
    //   newOptions.ceil = this.canvas.settings.thresholdUpperBoundW;

    //   this.optionsW = newOptions;
    // }


    // if (this.canvas.settings.thresholdLowerBoundC !== this.optionsC.floor) {
    //   changeDetectedC = true;
    // }

    // if (this.canvas.settings.thresholdUpperBoundC !== this.optionsC.ceil) {
    //   changeDetectedC = true;
    // }

    // if (changeDetectedC) {
    //   const newOptions: Options = Object.assign({}, this.optionsC);
    //   newOptions.floor = this.canvas.settings.thresholdLowerBoundC;
    //   newOptions.ceil = this.canvas.settings.thresholdUpperBoundC;

    //   this.optionsC = newOptions;
    // }
  // }
}