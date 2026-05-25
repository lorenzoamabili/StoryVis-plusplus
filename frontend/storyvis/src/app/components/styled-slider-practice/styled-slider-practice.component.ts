import { Component, DoCheck, Input } from '@angular/core';
import { Options } from '@m0t0r/ngx-slider';
import { Settings } from '../brainvis-canvas/utils/settings';

@Component({
  selector: 'app-styled-slider-practice',
  templateUrl: './styled-slider-practice.component.html',
  styleUrls: ['./styled-slider-practice.component.scss']
})


export class StyledSliderPracticeComponent implements DoCheck {
  public settings = Settings.getInstance(this);
  public valueW = 2012 - 0;
  public valueC = (2012 + 0) / 2;

  constructor() {
    if (this.settings.canvas) { this.settings.canvas.sliderPractice = this; }
    this.settings._thresholdValueC = this.valueC;
    this.settings._thresholdValueW = this.valueW;
  }


  optionsW: Options = {
    floor: 2012 - 0 - 2012 - 0 + 1,
    ceil: 2012 - 0 + 2012 - 0,
    step: 1,
    showTicks: false
  };

  optionsC: Options = {
    floor: (2012 + 0) / 2 - (2012 + 0) / 2 + 1,
    ceil: (2012 + 0) / 2 + (2012 + 0) / 2,
    step: 1,
    showTicks: false
  };


  setValueC(value: number) {
    this.valueC = value;
  }

  setValueW(value: number) {
    this.valueW = value;
  }

  getValueC() {
    return this.valueC;
  }

  getValueW() {
    return this.valueW;
  }
  
  ngDoCheck() {
    if(this.settings.isComparisonMode){
      this.settings.canvasComparison.sliderPractice = this;
    }
  }
}