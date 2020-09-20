import { Input, Output, EventEmitter } from '@angular/core';
import { BrainvisCanvasComponent } from '../brainvis-canvas.component';

export class Settings {
    @Input('studyStarted') studyStarted: boolean;

    public static instance: Settings;
    public canvas: BrainvisCanvasComponent;
    public valueChanged: boolean = false;
    public valueSetManually: boolean = true;
    public slider: string = "none";
    public token: boolean = true;
    public initW: boolean = false;
    public initC: boolean = false;

    public _colorMap = 'grayscale';
    public _thresholdValueW = 5119;
    public _thresholdValueC = 512;
    public _thresholdLowerBoundW = -6000;
    public _thresholdUpperBoundW = 6000;
    public _thresholdLowerBoundC = -1000;
    public _thresholdUpperBoundC = 1000;
    private _rulerMode = false;
    private _angleMode = false;
    private _freehandMode = false;
    private _voxelprobeMode = false;
    private _annotationMode = false;

    get colorMap() { return Settings.instance._colorMap; }
    get thresholdValueW() { return Settings.instance._thresholdValueW; }
    get thresholdValueC() { return Settings.instance._thresholdValueC; }
    get thresholdLowerBoundW() { return Settings.instance._thresholdLowerBoundW; }
    get thresholdUpperBoundW() { return Settings.instance._thresholdUpperBoundW; }
    get thresholdLowerBoundC() { return Settings.instance._thresholdLowerBoundC; }
    get thresholdUpperBoundC() { return Settings.instance._thresholdUpperBoundC; }
    get rulerMode() { return Settings.instance._rulerMode; }
    get angleMode() { return Settings.instance._angleMode; }
    get freehandMode() { return Settings.instance._freehandMode; }
    get voxelprobeMode() { return Settings.instance._voxelprobeMode; }
    get annotationMode() { return Settings.instance._annotationMode; }

    private constructor() {
     }

    // set thresholdLowerBoundW(value: number) {
    //     Settings.instance._thresholdLowerBoundW = value;
    // }

    // set thresholdUpperBoundW(value: number) {
    //     Settings.instance._thresholdUpperBoundW = value;
    // }

    // set thresholdLowerBoundC(value: number) {
    //     Settings.instance._thresholdLowerBoundC = value;
    // }

    // set thresholdUpperBoundC(value: number) {
    //     Settings.instance._thresholdUpperBoundC = value;
    // }

    @Input() set thresholdValueW(valueW: number) {
        this.slider = 'sliderW';

        if (this.canvas._axialRenderer.stackHelper) {
            const oldValueC: number = this.initC ? this.canvas._axialRenderer.stackHelper.slice._stack._windowCenter : this._thresholdValueC;
            const oldValueW: number = this.initW ? this.canvas._axialRenderer.stackHelper.slice._stack._windowWidth : this._thresholdValueW;
            this.valueChanged = (valueW !== oldValueW) ? true : false;

            if (this.valueChanged) {
                this.canvas.dispatchEvent({
                    type: 'thresholdValueChangeStartW',
                    changes: {
                        valueW: oldValueW,
                        valueC: oldValueC,
                        slider: this.slider
                    }
                });

                this.canvas.dispatchEvent({
                    type: 'thresholdValueChangedW',
                    changes: {
                        valueW: valueW,
                        valueC: oldValueC,
                        slider: this.slider
                    }
                });
                if (!this.valueSetManually && !this.token) {
                }
                else {
                    this.canvas.setWindowLevel(valueW, oldValueC, this.slider);
                }
                this.valueSetManually = !this.valueSetManually;
                this.token = true;
                this.initW = true;
            }
        }
    }


    @Input() set thresholdValueC(valueC: number) {
        // Settings.instance.stackHelper.slice.thicknessMethod = 1;
        // Settings.instance.stackHelper.slice.thickness = 2;
        // Settings.instance.stackHelper.slice.steps = 2;
        this.slider = 'sliderC';

        if (this.canvas._axialRenderer.stackHelper) {
            const oldValueC: number = this.initC ? this.canvas._axialRenderer.stackHelper.slice._stack._windowCenter : this._thresholdValueC;
            const oldValueW: number = this.initW ? this.canvas._axialRenderer.stackHelper.slice._stack._windowWidth : this._thresholdValueW;
            this.valueChanged = (valueC !== oldValueC) ? true : false;

            if (this.valueChanged) {
                this.canvas.dispatchEvent({
                    type: 'thresholdValueChangeStartC',
                    changes: {
                        valueW: oldValueW,
                        valueC: oldValueC,
                        slider: this.slider
                    }
                });

                this.canvas.dispatchEvent({
                    type: 'thresholdValueChangedC',
                    changes: {
                        valueW: oldValueW,
                        valueC: valueC,
                        slider: this.slider
                    }
                });
                if (!this.valueSetManually && !this.token) {
                } else {
                    this.canvas.setWindowLevel(oldValueW, valueC, this.slider);
                }
                this.valueSetManually = !this.valueSetManually;
                this.token = true;
                this.initC = true;
            }
        }
    }




    // @Input() set thresholdValueW(value: number) {
    //     Settings.instance._thresholdValueW = value;

    //     if (Settings.instance.canvas.initialized && Settings.instance.canvas.perspectiveRenderer.stackHelper) {
    //         Settings.instance.canvas.perspectiveRenderer.stackHelper.slice.lowerThreshold = Settings.instance._thresholdValueW;
    //         // Settings.instance.canvas.perspectiveRenderer.stackHelper.slice.intensityAuto = false;
    //     }
    //     const oldValue = this.canvas._sagittalRenderer.stackHelper.slice._stack._windowCenter;
    //     Settings.instance.thresholdValueChangeW.emit([oldValue, value]);
    // }
    // @Output() thresholdValueChangeW = new EventEmitter<number[]>();


    // @Input() set thresholdValueC(value: number) {
    //     Settings.instance._thresholdValueC = value;

    //     if (Settings.instance.canvas.initialized && Settings.instance.canvas.perspectiveRenderer.stackHelper) {
    //         Settings.instance.canvas.perspectiveRenderer.stackHelper.slice.upperThreshold = Settings.instance._thresholdValueC;
    //         // Settings.instance.canvas.perspectiveRenderer.stackHelper.slice.invert = true;

    //         // Settings.instance.stackHelper.slice.thicknessMethod = 1;
    //         // Settings.instance.stackHelper.slice.thickness = 2;
    //         // Settings.instance.stackHelper.slice.steps = 2;
    //     }
    //     const oldValue = this.canvas._sagittalRenderer.stackHelper.slice._stack._windowCenter;
    //     Settings.instance.thresholdValueChangeC.emit([oldValue, value]);
    // }
    // @Output() thresholdValueChangeC = new EventEmitter<number[]>();


    @Input() set colorMap(value: string) {
        Settings.instance._colorMap = value;
        if (Settings.instance.canvas.initialized && Settings.instance.canvas.perspectiveRenderer.stackHelper) {
            Settings.instance.canvas.perspectiveRenderer.stackHelper.slice.colorMap = Settings.instance._colorMap;
        }
        Settings.instance.colorMapValueChange.emit(value);
    }
    @Output() colorMapValueChange = new EventEmitter<string>();

    @Input() set rulerMode(rulerMode: boolean) {
        Settings.instance._rulerMode = rulerMode;
        Settings.instance.rulerModeChange.emit(rulerMode);
    }
    @Output() rulerModeChange = new EventEmitter<boolean>();

    @Input() set angleMode(angleMode: boolean) {
        Settings.instance._angleMode = angleMode;
        Settings.instance.angleModeChange.emit(angleMode);
    }
    @Output() angleModeChange = new EventEmitter<boolean>();

    @Input() set freehandMode(freehandMode: boolean) {
        Settings.instance._freehandMode = freehandMode;
        Settings.instance.freehandModeChange.emit(freehandMode);
    }
    @Output() freehandModeChange = new EventEmitter<boolean>();

    @Input() set voxelprobeMode(voxelprobeMode: boolean) {
        Settings.instance._voxelprobeMode = voxelprobeMode;
        Settings.instance.voxelprobeModeChange.emit(voxelprobeMode);
    }
    @Output() voxelprobeModeChange = new EventEmitter<boolean>();

    @Input() set annotationMode(annotationMode: boolean) {
        Settings.instance._annotationMode = annotationMode;
        Settings.instance.annotationModeChange.emit(annotationMode);
    }
    @Output() annotationModeChange = new EventEmitter<boolean>();

    static getInstance(canvas) {
        if (!Settings.instance) {
            Settings.instance = new Settings();

            Settings.instance.canvas = canvas;
        }

        return Settings.instance;
    }

    // getNewInstance(){
    //     Settings.instance = new Settings();
    // }

    ngOnInit(){

    }

}
