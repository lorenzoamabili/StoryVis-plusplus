import { Input, Output, EventEmitter, Component } from '@angular/core';
import { BrainvisCanvasComponent } from '../brainvis-canvas.component';
import { ComparisonComponent } from '../comparison.component';

@Component({
    template: ''
})

export class Settings {
    @Input('studyStarted') studyStarted: boolean;

    public static instance: Settings;
    public canvas: BrainvisCanvasComponent;
    public canvasComparison1: BrainvisCanvasComponent;
    public canvasComparison2: ComparisonComponent;
    public _canvas: BrainvisCanvasComponent | ComparisonComponent;

    public syncScroll: boolean = false;
    public isOneView: string = '';
    public automaticSettingW: boolean = false;
    public automaticSettingC: boolean = false;
    public slideDeckOpen: boolean = false;
    public localizersOn: boolean = false;
    public isComparisonMode: boolean = false;
    public isEducationMode: boolean = false;
    public treeButtons: boolean = false;
    public isSlideDeckOpen: boolean = false;
    public multiplePlanesModeOn: boolean = false;

    public _colorMap = 'grayscale';

    public _thresholdValueW;
    public _thresholdValueC;
    public _thresholdLowerBoundW;
    public _thresholdUpperBoundW;
    public _thresholdLowerBoundC;
    public _thresholdUpperBoundC;
    private _datacomicsMode = false;
    private _scrollytellingMode = false;
    
    public registryOn = false;

    public rulerOn = false;
    public angleOn = false;
    // public freehandOn = false;
    public voxelprobeOn = false;
    public annotationOn = false;

    private valueChanged: boolean = false;
    private initW: boolean = false;
    private initC: boolean = false;

    get thresholdValueW() { return Settings.instance._thresholdValueW; }
    get thresholdValueC() { return Settings.instance._thresholdValueC; }
    get thresholdLowerBoundW() { return Settings.instance._thresholdLowerBoundW; }
    get thresholdUpperBoundW() { return Settings.instance._thresholdUpperBoundW; }
    get thresholdLowerBoundC() { return Settings.instance._thresholdLowerBoundC; }
    get thresholdUpperBoundC() { return Settings.instance._thresholdUpperBoundC; }
    get rulerMode() { return Settings.instance.rulerOn; }
    get angleMode() { return Settings.instance.angleOn; }
    // get freehandMode() { return Settings.instance.freehandOn; }
    get voxelprobeMode() { return Settings.instance.voxelprobeOn; }
    get annotationMode() { return Settings.instance.annotationOn; }
    get datacomicsMode() { return Settings.instance._datacomicsMode; }
    get scrollytellingMode() { return Settings.instance._scrollytellingMode; }

    constructor() {
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
        if (valueW) {
            const slider = 'sliderW'

            if (this.canvas._axialRenderer.stackHelper) {
                const oldValueC: number = this.initC ? this.canvas._axialRenderer.stackHelper.slice._stack._windowCenter : this._thresholdValueC;
                const oldValueW: number = this.initW ? this.canvas._axialRenderer.stackHelper.slice._stack._windowWidth : this._thresholdValueW;
                this.valueChanged = (valueW !== oldValueW) ? true : false;

                if (this.valueChanged) {
                    if (!this.automaticSettingW) {
                    this.canvas.dispatchEvent({
                        type: 'thresholdValueChangeStartW',
                        changes: {
                            valueW: oldValueW,
                            valueC: oldValueC,
                            slider: slider
                        }
                    });

                    this.canvas.dispatchEvent({
                        type: 'thresholdValueChangedW',
                        changes: {
                            valueW: valueW,
                            valueC: oldValueC,
                            slider: slider
                        }
                    });
                }
                    this.canvas.setWindowLevel(valueW, oldValueC, slider);
                    this.initW = true;
                    this.automaticSettingW = false;
                }
            }
        }
    }


    @Input() set thresholdValueC(valueC: number) {
        if (valueC) {
            const slider = 'sliderC'

            if (this.canvas._axialRenderer.stackHelper) {
                const oldValueC: number = this.initC ? this.canvas._axialRenderer.stackHelper.slice._stack._windowCenter : this._thresholdValueC;
                const oldValueW: number = this.initW ? this.canvas._axialRenderer.stackHelper.slice._stack._windowWidth : this._thresholdValueW;
                this.valueChanged = (valueC !== oldValueC) ? true : false;

                if (this.valueChanged) {
                    if (!this.automaticSettingC) {
                    this.canvas.dispatchEvent({
                        type: 'thresholdValueChangeStartC',
                        changes: {
                            valueW: oldValueW,
                            valueC: oldValueC,
                            slider: slider
                        }
                    });

                    this.canvas.dispatchEvent({
                        type: 'thresholdValueChangedC',
                        changes: {
                            valueW: oldValueW,
                            valueC: valueC,
                            slider: slider
                        }
                    });
                }
                    this.canvas.setWindowLevel(oldValueW, valueC, slider);
                    this.initC = true;
                    this.automaticSettingC = false;
                }
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


    @Input() set rulerMode(rulerMode: boolean) {
        Settings.instance.rulerOn = rulerMode;
        Settings.instance.rulerModeChange.emit(rulerMode);
        if (Settings.instance.angleOn) {
            Settings.instance.angleOn = false;
            Settings.instance.angleModeChange.emit(false);
        }
        if (Settings.instance.voxelprobeOn) {
            Settings.instance.voxelprobeOn = false;
            Settings.instance.voxelprobeModeChange.emit(false);
        }
        if (Settings.instance.annotationOn) {
            Settings.instance.annotationOn = false;
            Settings.instance.annotationModeChange.emit(false);
        }
    }
    @Output() rulerModeChange = new EventEmitter<boolean>();

    @Input() set angleMode(angleMode: boolean) {
        Settings.instance.angleOn = angleMode;
        Settings.instance.angleModeChange.emit(angleMode);
        if (Settings.instance.rulerOn) {
            Settings.instance.rulerOn = false;
            Settings.instance.rulerModeChange.emit(false);
        }
        if (Settings.instance.voxelprobeOn) {
            Settings.instance.voxelprobeOn = false;
            Settings.instance.voxelprobeModeChange.emit(false);
        }
        if (Settings.instance.annotationOn) {
            Settings.instance.annotationOn = false;
            Settings.instance.annotationModeChange.emit(false);
        }
    }
    @Output() angleModeChange = new EventEmitter<boolean>();

    // @Input() set freehandMode(freehandMode: boolean) {
    //     Settings.instance.freehandOn = freehandMode;
    //     Settings.instance.freehandModeChange.emit(freehandMode);
    // }
    // @Output() freehandModeChange = new EventEmitter<boolean>();

    @Input() set voxelprobeMode(voxelprobeMode: boolean) {
        Settings.instance.voxelprobeOn = voxelprobeMode;
        Settings.instance.voxelprobeModeChange.emit(voxelprobeMode);
        if (Settings.instance.angleOn) {
            Settings.instance.angleOn = false;
            Settings.instance.angleModeChange.emit(false);
        }
        if (Settings.instance.rulerOn) {
            Settings.instance.rulerOn = false;
            Settings.instance.rulerModeChange.emit(false);
        }
        if (Settings.instance.annotationOn) {
            Settings.instance.annotationOn = false;
            Settings.instance.annotationModeChange.emit(false);
        }
    }
    @Output() voxelprobeModeChange = new EventEmitter<boolean>();

    @Input() set annotationMode(annotationMode: boolean) {
        Settings.instance.annotationOn = annotationMode;
        Settings.instance.annotationModeChange.emit(annotationMode);
        if (Settings.instance.angleOn) {
            Settings.instance.angleOn = false;
            Settings.instance.angleModeChange.emit(false);
        }
        if (Settings.instance.voxelprobeOn) {
            Settings.instance.voxelprobeOn = false;
            Settings.instance.voxelprobeModeChange.emit(false);
        }
        if (Settings.instance.rulerOn) {
            Settings.instance.rulerOn = false;
            Settings.instance.rulerModeChange.emit(false);
        }
    }
    @Output() annotationModeChange = new EventEmitter<boolean>();

    @Input() set datacomicsMode(datacomicsMode: boolean) {
        Settings.instance._datacomicsMode = datacomicsMode;
        Settings.instance.datacomicsModeChange.emit(datacomicsMode);
    }
    @Output() datacomicsModeChange = new EventEmitter<boolean>();

    @Input() set scrollytellingMode(scrollytellingMode: boolean) {
        Settings.instance._scrollytellingMode = scrollytellingMode;
        Settings.instance.scrollytellingModeChange.emit(scrollytellingMode);
    }
    @Output() scrollytellingModeChange = new EventEmitter<boolean>();

    static getInstance(canvas) {
        if (!Settings.instance) {
            Settings.instance = new Settings();

            Settings.instance._canvas = canvas;
        }

        return Settings.instance;
    }
}
