import { View } from './utils/types';

import * as AMI from 'ami.js';
import * as THREE from 'three';
import { EventEmitter, Output, Component } from '@angular/core';
import { Settings } from './utils/settings';

@Component({
    template: ''
})

export class AMIRenderer {
    protected _initialized = false;
    public settings = Settings.getInstance(this);
    public _canvas = this.settings.canvas; // to avoid circular dependency

    protected _color = 0x121212;
    protected _targetID = 1;

    protected _domElement: HTMLElement;
    protected _domID: string;
    protected _renderer: THREE.WebGLRenderer;
    protected _camera: any;
    protected _controls: any;
    protected _scene: THREE.Scene;
    protected _light: THREE.Light;
    protected _oldRenderer: any;

    public _sliceOrientation: string;
    protected _sliceColor: number;

    protected _stackHelper: AMI.HelpersStack;

    @Output() magnificationCreated = new EventEmitter<String>();
    @Output() reductionCreated = new EventEmitter<String>();

    constructor(view: View) {
        this._domID = view.domId;
        this._domElement = document.getElementById(this._domID);
    }

    public get camera() {
        return this._camera;
    }

    public get controls() {
        return this._controls;
    }

    public get scene(): THREE.Scene {
        return this._scene;
    }

    public get domElement(): HTMLElement {
        return this._domElement;
    }

    public get stackHelper(): AMI.HelpersStack {
        return this._stackHelper;
    }

    public get renderer() {
        return this._renderer;
    }

    public get oldRenderer() {
        return this._oldRenderer;
    }

    addEventListeners() {
        this._controls.addEventListener('mousewheel', this.onScroll.bind(this));
        this._controls.addEventListener('OnScroll', this.onScroll.bind(this));
        this.domElement.addEventListener('click', this.onShiftClick.bind(this));
    }


    protected onScroll(event) {
        // if (this._initialized) {

        //     this._canvas.onAxialChanged();
        //     this._canvas.onCoronalChanged();
        //     this._canvas.onSagittalChanged();
        // }
    }


    protected onShiftClick(event) {
        if (this._initialized) {
            if (event.shiftKey) {
                this._canvas.displayOneView(this._domID);
                if (this._canvas.settings.isOneView) {
                    this.magnificationCreated.emit(this._domID);
                } else {
                    this.reductionCreated.emit(this._domID);
                }
            }
        }
    }
}
