import { Input, Output, EventEmitter } from '@angular/core';
import { BrainvisCanvasComponent } from '../brainvis-canvas.component';

export class Settings {
    public static instance: Settings;
    public canvas: BrainvisCanvasComponent;
    public _dataInitC: boolean = false;
    public _dataInitW: boolean = false;

    public _colorMap = 'grayscale';
    public _thresholdValueW = 20;
    public _thresholdValueC = 20;
    public _thresholdLowerBoundW = 0;
    public _thresholdUpperBoundW = 2500;
    public _thresholdLowerBoundC = 0;
    public _thresholdUpperBoundC = 2500;
    public _rulerMode = false;
    public _angleMode = false;
    // public _freehandMode = false;
    public _voxelprobeMode = false;
    public _annotationMode = false;

    get colorMap() { return Settings.instance._colorMap; }
    get thresholdValueW() { return Settings.instance._thresholdValueW; }
    get thresholdValueC() { return Settings.instance._thresholdValueC; }
    get thresholdLowerBoundW() { return Settings.instance._thresholdLowerBoundW; }
    get thresholdUpperBoundW() { return Settings.instance._thresholdUpperBoundW; }
    get thresholdLowerBoundC() { return Settings.instance._thresholdLowerBoundC; }
    get thresholdUpperBoundC() { return Settings.instance._thresholdUpperBoundC; }
    get rulerMode() { return Settings.instance._rulerMode; }
    get angleMode() { return Settings.instance._angleMode; }
    // get freehandMode() { return Settings.instance._freehandMode; }
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

    @Input() set thresholdValueW(value: number) {
        this.canvas = (window as any).canvas;
        this._dataInitW = this.canvas.practiceSession ? this.canvas._dataInit : this._dataInitW;
        const oldValue: number = this.canvas._axialRenderer.stackHelper.slice._stack._windowWidth;
        if (value !== oldValue && this._dataInitW && Settings.instance.canvas.perspectiveRenderer.stackHelper) {

                this.canvas.dispatchEvent({
                    type: 'thresholdValueChangeStartW',
                    changes: {
                        value: oldValue
                    }
                });

                this.canvas.dispatchEvent({
                    type: 'thresholdValueChangedW',
                    changes: {
                        value: value
                    }
                });
                this.canvas.setWindowLevelW(value);
        }
        if(this.canvas.practiceSession = true) {
            this.canvas._dataInit = true;
        } else {
            this._dataInitW = true;
        }
    }


    @Input() set thresholdValueC(value: number) {
        this.canvas = (window as any).canvas;
        this._dataInitC = this.canvas.practiceSession ? this.canvas._dataInit : this._dataInitC;
        const oldValue: number = this.canvas._axialRenderer.stackHelper.slice._stack._windowCenter;
        if (value !== oldValue && this._dataInitC && Settings.instance.canvas.perspectiveRenderer.stackHelper) {

            // Settings.instance.stackHelper.slice.thicknessMethod = 1;
            // Settings.instance.stackHelper.slice.thickness = 2;
            // Settings.instance.stackHelper.slice.steps = 2;

                this.canvas.dispatchEvent({
                    type: 'thresholdValueChangeStartC',
                    changes: {
                        value: oldValue
                    }
                });

                this.canvas.dispatchEvent({
                    type: 'thresholdValueChangedC',
                    changes: {
                        value: value
                    }
                });
                this.canvas.setWindowLevelC(value);
            }
            if(this.canvas.practiceSession = true) {
                this.canvas._dataInit = true;
            } else {
                this._dataInitC = true;
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


    // @Input() set colorMap(value: string) {
    //     Settings.instance._colorMap = value;
    //     if (Settings.instance.canvas.initialized && Settings.instance.canvas.perspectiveRenderer.stackHelper) {
    //         Settings.instance.canvas.perspectiveRenderer.stackHelper.slice.colorMap = Settings.instance._colorMap;
    //     }
    //     Settings.instance.colorMapValueChange.emit(value);
    // }
    // @Output() colorMapValueChange = new EventEmitter<string>();

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

    // @Input() set freehandMode(freehandMode: boolean) {
    //     Settings.instance._freehandMode = freehandMode;
    //     Settings.instance.freehandModeChange.emit(freehandMode);
    // }
    // @Output() freehandModeChange = new EventEmitter<boolean>();

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

}
