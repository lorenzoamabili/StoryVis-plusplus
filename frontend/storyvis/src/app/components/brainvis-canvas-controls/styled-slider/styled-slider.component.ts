import { Component, Input, DoCheck } from '@angular/core';
import { BrainvisCanvasComponent } from '../../brainvis-canvas/brainvis-canvas.component';
import { Options } from 'ng5-slider';

@Component({
  selector: 'app-styled-slider',
  templateUrl: './styled-slider.component.html',
  styleUrls: ['./styled-slider.component.scss']
})
export class StyledSliderComponent implements DoCheck {
  @Input() canvas: BrainvisCanvasComponent;

  constructor() {}

  optionsW: Options = {
    floor: 0,
    ceil: 1426,
    step: 1,
    showTicks: false
  };

  optionsC: Options = {
    floor: 0,
    ceil: 1426,
    step: 1,
    showTicks: false
  };

  ngDoCheck() {
    let changeDetectedW = false;
    let changeDetectedC = false;

    if (this.canvas.settings.thresholdLowerBoundW !== this.optionsW.floor) {
      changeDetectedW = true;
    }

    if (this.canvas.settings.thresholdUpperBoundW !== this.optionsW.ceil) {
      changeDetectedW = true;
    }

    if (changeDetectedW) {
      const newOptions: Options = Object.assign({}, this.optionsW);
      newOptions.floor = this.canvas.settings.thresholdLowerBoundW;
      newOptions.ceil = this.canvas.settings.thresholdUpperBoundW;

      this.optionsW = newOptions;
    }



    if (this.canvas.settings.thresholdLowerBoundC !== this.optionsC.floor) {
      changeDetectedC = true;
    }

    if (this.canvas.settings.thresholdUpperBoundC !== this.optionsC.ceil) {
      changeDetectedC = true;
    }

    if (changeDetectedC) {
      const newOptions: Options = Object.assign({}, this.optionsC);
      newOptions.floor = this.canvas.settings.thresholdLowerBoundC;
      newOptions.ceil = this.canvas.settings.thresholdUpperBoundC;

      this.optionsC = newOptions;
    }
  }
}