import { Input, Output, EventEmitter } from '@angular/core';
import { BrainvisCanvasComponent } from '../brainvis-canvas.component';
import { Renderer2D } from '../renderer2d';

export class Settings {
    private static instance: Settings;
    private canvas: BrainvisCanvasComponent;

    private _colorMap = 'grayscale';
    private _thresholdLowerBoundW = 0;
    private _thresholdValueW = 20;
    private _thresholdUpperBoundW = 1426;
    private _thresholdLowerBoundC = 0;
    private _thresholdValueC = 20;
    private _thresholdUpperBoundC = 1426;
    private _measurementMode = false;
    private _angleMode = false;
    private _freehandMode = false;
    private _voxelprobeMode = false;
    private _annotationMode = false;

    get colorMap() { return Settings.instance._colorMap; }
    get thresholdLowerBoundW() { return Settings.instance._thresholdLowerBoundW; }
    get thresholdValueW() { return Settings.instance._thresholdValueW; }
    get thresholdUpperBoundW() { return Settings.instance._thresholdUpperBoundW; }
    get thresholdLowerBoundC() { return Settings.instance._thresholdLowerBoundC; }
    get thresholdValueC() { return Settings.instance._thresholdValueC; }
    get thresholdUpperBoundC() { return Settings.instance._thresholdUpperBoundC; }
    get measurementMode() { return Settings.instance._measurementMode; }
    get angleMode() { return Settings.instance._angleMode; }
    get freehandMode() { return Settings.instance._freehandMode; }

    private constructor() { }

    set thresholdLowerBoundW(value: number) {
        Settings.instance._thresholdLowerBoundW = value;
    }

    set thresholdUpperBoundW(value: number) {
        Settings.instance._thresholdUpperBoundW = value;
    }

    set thresholdLowerBoundC(value: number) {
        Settings.instance._thresholdLowerBoundC = value;
    }

    set thresholdUpperBoundC(value: number) {
        Settings.instance._thresholdUpperBoundC = value;
    }

    @Input() set thresholdValueW(value: number) {
        Settings.instance._thresholdValueW = value;

        if (Settings.instance.canvas.initialized && Settings.instance.canvas.perspectiveRenderer.stackHelper) {
            Settings.instance.canvas.perspectiveRenderer.stackHelper.slice.lowerThreshold = Settings.instance._thresholdValueW;
            Settings.instance.canvas.perspectiveRenderer.stackHelper.slice.intensityAuto = false;

            this.canvas._axialRenderer.stackHelper.slice._stack._windowWidth = value;
            this.canvas._coronalRenderer.stackHelper.slice._stack._windowWidth = value;
            this.canvas._sagittalRenderer.stackHelper.slice._stack._windowWidth = value;
            this.canvas.updateWindowLevel();
        }
        Settings.instance.thresholdValueChangeW.emit(value);
    }
    @Output() thresholdValueChangeW = new EventEmitter<number>();



    @Input() set thresholdValueC(value: number) {
        Settings.instance._thresholdValueC = value;

        if (Settings.instance.canvas.initialized && Settings.instance.canvas.perspectiveRenderer.stackHelper) {
            Settings.instance.canvas.perspectiveRenderer.stackHelper.slice.upperThreshold = Settings.instance._thresholdValueC;
            Settings.instance.canvas.perspectiveRenderer.stackHelper.slice.invert = true;

            this.canvas._axialRenderer.stackHelper.slice._stack._windowCenter = value;
            this.canvas._coronalRenderer.stackHelper.slice._stack._windowCenter = value;
            this.canvas._sagittalRenderer.stackHelper.slice._stack._windowCenter = value;
            this.canvas.updateWindowLevel(); 

            // Settings.instance.stackHelper.slice.thicknessMethod = 1;
            // Settings.instance.stackHelper.slice.thickness = 2;
            // Settings.instance.stackHelper.slice.steps = 2;
        }
        Settings.instance.thresholdValueChangeC.emit(value);
    }
    @Output() thresholdValueChangeC = new EventEmitter<number>();


    @Input() set colorMap(value: string) {
        Settings.instance._colorMap = value;
        if (Settings.instance.canvas.initialized && Settings.instance.canvas.perspectiveRenderer.stackHelper) {
            Settings.instance.canvas.perspectiveRenderer.stackHelper.slice.colorMap = Settings.instance._colorMap;
        }
        Settings.instance.colorMapValueChange.emit(value);
    }
    @Output() colorMapValueChange = new EventEmitter<string>();

    @Input() set measurementMode(measurementMode: boolean) {
        Settings.instance._measurementMode = measurementMode;
        Settings.instance.measurementModeChange.emit(measurementMode);
    }
    @Output() measurementModeChange = new EventEmitter<boolean>();

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

}
