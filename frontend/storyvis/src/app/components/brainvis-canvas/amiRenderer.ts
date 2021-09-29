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
    public _canvas = this.settings._canvas; // to avoid circular dependency

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
    protected _localizerHelper: AMI.HelpersLocalizer;
    protected _localizerScene: THREE.Scene;

    public _sliceOrientation: string;
    protected _sliceColor: number;

    protected _stackHelper: AMI.HelpersStack;

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

    public get localizerHelper(): AMI.HelpersLocalizer {
        return this._localizerHelper;
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
        this.domElement.addEventListener('click', this.onAltClick.bind(this));
    }


    protected onScroll(event) {
        if (this._initialized) {
            this._canvas.onAxialChanged();
            this._canvas.onCoronalChanged();
            this._canvas.onSagittalChanged();
            this._canvas.onMulti1Changed();
            this._canvas.onMulti2Changed();
        }
    }

    protected onAltClick(event) {
        if (event.altKey) {
            if (this._initialized) {
                this._canvas.addFrame('datacomics', this._domID);
            }
        }
    }

    protected onShiftClick(event) {
        if (event.shiftKey) {
            if (this._initialized) {
                this._canvas.displayOneView(this._domID);
            }
        }
    }

    protected onDoubleClick(event) {
        if (this._initialized) {
            const canvas = event.target.parentElement;
            const mouse = {
                x: ((event.clientX - canvas.offsetLeft) / canvas.clientWidth) * 2 - 1,
                y: -((event.clientY - canvas.offsetTop) / canvas.clientHeight) * 2 + 1,
            };

            const raycaster = new THREE.Raycaster();
            raycaster.setFromCamera(mouse, this._camera);

            const intersects = raycaster.intersectObjects(this._scene.children, true);

            if (intersects.length > 0) {
                const ijk = AMI.UtilsCore.worldToData(this._stackHelper.stack.lps2IJK, intersects[0].point);
                this._canvas.adjustLocalizersOnDoubleClick(ijk);
            }
        }
    }
}
