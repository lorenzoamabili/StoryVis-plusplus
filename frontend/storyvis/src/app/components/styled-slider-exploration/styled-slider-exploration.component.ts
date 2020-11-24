import { Component, DoCheck } from '@angular/core';
import { Options } from '@m0t0r/ngx-slider';
import { Settings } from '../brainvis-canvas/utils/settings';

@Component({
  selector: 'app-styled-slider-exploration',
  templateUrl: './styled-slider-exploration.component.html',
  styleUrls: ['./styled-slider-exploration.component.scss']
})


export class StyledSliderExplorationComponent implements DoCheck {
  public settings = Settings.getInstance(this);
  public valueW = 3071 + 2048;
  public valueC = (3071 - 2048) / 2;

  constructor() {
    this.settings.canvas.sliderExploration = this;

    this.settings._thresholdValueC = this.valueC;
    this.settings._thresholdValueW = this.valueW;
  }

  optionsW: Options = {
    floor: -2048 - 3071 + 2048 + 1,
    ceil: 3071 + 3071 + 2048,
    step: 1,
    showTicks: false
  };

  optionsC: Options = {
    floor: -2048 - (3071 - 2048) / 2 + 1,
    ceil: 3071 + (3071 - 2048) / 2,
    step: 1,
    showTicks: false
  };


  setValueC(value: number) {
    this.valueC = value;
  }

  setValueW(value: number) {
    this.valueW = value;
  }


  ngDoCheck() {
  }
}