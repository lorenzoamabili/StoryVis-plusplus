import * as THREE from 'three';
import * as AMI from 'ami.js';

import { Component, ElementRef, HostListener, OnInit, Input, 
  // RendererType2, EventEmitter, Output 
} from '@angular/core';
import { IOrientation, ISlicePosition, View } from './utils/types';
// import SliceManipulatorWidget from './utils/sliceManipulatorWidget';
import { registerActions } from './provenanceHelpers/provenanceActions';
import { addListeners } from './provenanceHelpers/provenanceListeners';
import { Settings } from './utils/settings';
import { Renderer2D } from './renderer2d';
import { Renderer3D } from './renderer3d';
import { Artifact } from '@visualstorytelling/provenance-core/src/api';
import { ProvenanceService } from '../../shared/_services/provenance.service';
import { StyledSliderPracticeComponent } from '../styled-slider-practice/styled-slider-practice.component';
import { StyledSliderExplorationComponent } from '../styled-slider-exploration/styled-slider-exploration.component';


export enum VIEWS {
  AXIAL = 'axial',
  SAGITTAL = 'sagittal',
  CORONAL = 'coronal',
  FREEFORM = 'freeform'
}

@Component({
  selector: 'app-brainvis-canvas',
  templateUrl: './brainvis-canvas.component.html',
  styleUrls: ['./brainvis-canvas.component.css']
})
export class BrainvisCanvasComponent extends THREE.EventDispatcher implements OnInit {
  @Input() studyStarted: boolean;

  public _initialized = false;
  public settings = Settings.getInstance(this);

  private stack: any;
  public sliderPractice: StyledSliderPracticeComponent;
  public sliderExploration: StyledSliderExplorationComponent;

  private elem: Element;
  public views: View[] = [
    { // Left top view (TOP/AXIAL): Patient's top side towards camera, patient's right side to the left
      domId: 'r0',

      left: 0.0,
      top: 0.0,
      width: 0.5,
      height: 0.5,

      color: 0x121212,
      sliceOrientation: VIEWS.AXIAL,
      sliceColor: 0xff1744,
      targetID: 0
    },
    { // Right top view: Perspective camera
      domId: 'r1',

      left: 0.5,
      top: 0.0,
      width: 0.5,
      height: 0.5,

      color: 0x121212,
      sliceOrientation: VIEWS.FREEFORM,
      sliceColor: 0xffffff,
      targetID: 1
    },
    { // Left bottom view (FRONT/CORONAL): Patient's face towards camera, patient's right side to the left
      domId: 'r2',

      left: 0.5,
      top: 0.0,
      width: 0.5,
      height: 0.5,

      color: 0x121212,
      sliceOrientation: VIEWS.CORONAL,
      sliceColor: 0x76ff03,
      targetID: 2
    },
    { // Right bottom view (SIDE/SAGITTAL): Patient's left side towards camera, patient's face to the left
      domId: 'r3',

      left: 0.5,
      top: 0.5,
      width: 0.5,
      height: 0.5,

      color: 0x121212,
      sliceOrientation: VIEWS.SAGITTAL,
      sliceColor: 0xffea00,
      targetID: 3
    }
  ];

  private textureTarget: THREE.WebGLRenderTarget;
  private contourHelper: AMI.ContourHelper;
  private contourScene: THREE.Scene;

  public _perspectiveRenderer: Renderer3D;
  public _axialRenderer: Renderer2D;
  public _coronalRenderer: Renderer2D;
  public _sagittalRenderer: Renderer2D;

  // extra variables to show mesh plane intersections in 2D renderers
  private clipPlaneAxial = new THREE.Plane(new THREE.Vector3(0, 0, 0), 0);
  private clipPlaneCoronal = new THREE.Plane(new THREE.Vector3(0, 0, 0), 0);
  private clipPlaneSagittal = new THREE.Plane(new THREE.Vector3(0, 0, 0), 0);

  // private sliceManipulator: SliceManipulatorWidget;

  private _provenance: ProvenanceService;

  constructor(elem: ElementRef, public provenance: ProvenanceService) {
    super();
    registerActions(provenance.registry, this);
    this._provenance = provenance;
    this.elem = elem.nativeElement;
    this.settings.canvas = this;
    }

  get perspectiveRenderer() {
    return this._perspectiveRenderer;
  }

  get initialized() {
    return this._initialized;
  }

  getRenderer(view: VIEWS) {
    switch (view) {
      case VIEWS.SAGITTAL: return this._sagittalRenderer;
      case VIEWS.AXIAL: return this._axialRenderer;
      case VIEWS.CORONAL: return this._coronalRenderer;
      case VIEWS.FREEFORM: return this._perspectiveRenderer;
      default: throw new Error('no such view: ' + view);
    }
  }

  get renderers() {
    return [
      this._axialRenderer,
      this._perspectiveRenderer,
      this._coronalRenderer,
      this._sagittalRenderer];
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.renderers.forEach(renderer => {
      if (renderer.scene.children.length > 0) {
        renderer.onWindowResize();
      }
    });
  }

  ngOnInit() {
    // todo: remove object from window
    // (window as any).canvas = this;

    this._axialRenderer = new Renderer2D(this.views[0]);
    this._perspectiveRenderer = new Renderer3D(this.views[1]);
    this._coronalRenderer = new Renderer2D(this.views[2]);
    this._sagittalRenderer = new Renderer2D(this.views[3]);

    this.renderers.forEach(renderer => renderer.init());

    this.loadData((this.studyStarted) ?
      // 'https://glcdn.githack.com/lorenzo.amabili/dicomdatalab/raw/master/data/prova1.nii.gz' : 
      'https://rawcdn.githack.com/lorenzoamabili/DICOMdata/1596c8cf93a5505166375daf67c9d450e0f3bbda/data/prova1.nii.gz' :
      'https://rawcdn.githack.com/VisualStorytelling/data/94dd382a51958824eb6bf4cf529f5b7bce383f99/fnndsc/adi_brain.nii.gz');


    this.addEventListeners();
    this.animate();

    this.settings.rulerModeChange.subscribe(this.toggleRulerMode.bind(this));
    this.settings.angleModeChange.subscribe(this.toggleAngleMode.bind(this));
    // this.settings.freehandModeChange.subscribe(this.toggleFreehandMode.bind(this));
    this.settings.voxelprobeModeChange.subscribe(this.toggleVoxelprobeMode.bind(this));
    this.settings.annotationModeChange.subscribe(this.toggleAnnotationMode.bind(this));

    addListeners(this._provenance.tracker);
  }

  async resize() {
    this.renderers.forEach(renderer => renderer.onWindowResize());
 }

  async loadData(url: string) {
    let loader = new AMI.VolumeLoader();

    this.removeScene();

    try {
      await loader.load(url);
      // merge files into clean series/stack/frame structure
      const series = loader.data[0].mergeSeries(loader.data)[0];
      loader.free();
      loader = null;

      this.stack = series.stack[0];
      this.stack.prepare();

      // set camera and scene
      this.prepareCamera(this._perspectiveRenderer);
      this.prepareScene(this._axialRenderer);


      // // event listeners
      this.renderers.forEach(renderer => renderer.addEventListeners());
      this._initialized = true;
      this.resize();
    } catch (error) {
      window.console.log('oops... something went wrong...');
      window.console.log(error);
    }
  }

  removeScene() {
    this.renderers.forEach(renderer => {
      const scene = renderer.scene;
      while (scene.children.length > 0) {
        scene.remove(scene.children[0]);
      }
    });
  }

  prepareCamera(renderer3D: Renderer3D) {
    // center 3d camera/control on the stack
    const centerLPS = this.stack.worldCenter();
    const perspectiveCamera = <THREE.PerspectiveCamera>renderer3D.camera;
    perspectiveCamera.lookAt(new THREE.Vector3(centerLPS.x, centerLPS.y, centerLPS.z));
    perspectiveCamera.updateProjectionMatrix();

    const perspectiveControls = renderer3D.controls;
    perspectiveControls.target.set(centerLPS.x, centerLPS.y, centerLPS.z);
  }

  prepareScene(renderer: Renderer2D) {
    // bounding box
    const boxHelper = new AMI.BoundingBoxHelper(this.stack);
    this._perspectiveRenderer.scene.add(boxHelper);

    // Freeform slice
    this._perspectiveRenderer.initHelpersStack(this.stack);

    [this._axialRenderer, this._coronalRenderer, this._sagittalRenderer].forEach(renderer => {
      renderer.initHelpersStack(this.stack);
      this._perspectiveRenderer.scene.add(renderer.scene);
    });


    // Init render to texture target
    this.textureTarget = new THREE.WebGLRenderTarget(
      renderer.domElement.clientWidth,
      renderer.domElement.clientHeight,
      {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.NearestFilter,
        format: THREE.RGBAFormat,
      }
    );

    this.contourHelper = new AMI.ContourHelper(this.stack, renderer.stackHelper.slice.geometry);
    this.contourHelper.canvasWidth = this.textureTarget.width;
    this.contourHelper.canvasHeight = this.textureTarget.height;
    this.contourHelper.textureToFilter = this.textureTarget.texture;
    this.contourScene = new THREE.Scene();
    this.contourScene.add(this.contourHelper);
  }


  addEventListeners() {
  }

  animate = () => {
    requestAnimationFrame(this.animate.bind(this));
    if (this._initialized) {
      this.render();
    }
  }

  render() {
    this.renderers.forEach(renderer => renderer.render());
  }

  // setInitValuesWL() {
  // }

  displayOneView(viewID: string) {
    const oldPerspectiveRenderer = this._perspectiveRenderer;
    const oldStackIndexA = this._axialRenderer.stackHelper.index;
    const oldStackIndexC = this._coronalRenderer.stackHelper.index;
    const oldStackIndexS = this._sagittalRenderer.stackHelper.index;

    if (!this.settings.isOneView) {
      this.createOneView(viewID);
    } else {
      this.create4Views(viewID);
    }

    this.removeScene();

    this.prepareCamera(this._perspectiveRenderer);
    this._perspectiveRenderer.setCameraOrientation(oldPerspectiveRenderer.getCameraOrientation(), 10);
    this.prepareScene(this._axialRenderer);

    this.setSliceIndex(VIEWS.AXIAL, oldStackIndexA);
    this.setSliceIndex(VIEWS.CORONAL, oldStackIndexC);
    this.setSliceIndex(VIEWS.SAGITTAL, oldStackIndexS);
  }


  createOneView(viewID: string) {
    document.getElementById('main').setAttribute('class', 'visualizerOne');

    this.renderers.forEach(renderer => renderer.domElement.setAttribute('style', 'display: none;'));

    document.getElementById(viewID).setAttribute('class', 'rendererOne');
    document.getElementById(viewID).setAttribute('style', 'display: block;');

    this.settings.isOneView = true;
  }


  create4Views(viewID: string) {
    document.getElementById('main').setAttribute('class', 'visualizer');
    document.getElementById(viewID).setAttribute('class', 'renderer');

    this.renderers.forEach(renderer => renderer.domElement.setAttribute('style', 'display: block;'));

    this.settings.isOneView = false;
  }


  onAxialChanged() {
    // this._axialRenderer.updateLocalizer([this._coronalRenderer.localizerHelper, this._sagittalRenderer.localizerHelper]);
    this._axialRenderer.updateClipPlane(this.clipPlaneAxial);
    if (this.contourHelper) {
      this.contourHelper.geometry = this._axialRenderer.stackHelper.slice.geometry;
    }
  }

  onCoronalChanged() {
    // this._coronalRenderer.updateLocalizer([this._axialRenderer.localizerHelper, this._sagittalRenderer.localizerHelper]);
    this._coronalRenderer.updateClipPlane(this.clipPlaneCoronal);
  }

  onSagittalChanged() {
    // this._sagittalRenderer.updateLocalizer([this._axialRenderer.localizerHelper, this._coronalRenderer.localizerHelper]);
    this._sagittalRenderer.updateClipPlane(this.clipPlaneSagittal);
  }

  // setInitValuesWL() {
  //   // this.settings._thresholdLowerBoundC = (this._axialRenderer.stackHelper.stack.minMax[0]);
  //   // this.settings._thresholdUpperBoundC = (this._axialRenderer.stackHelper.stack.minMax[1]);
  // }

  
  setWindowLevel(valueW, valueC, slider) {

    if (slider === 'sliderW') {
      this.settings.canvas.perspectiveRenderer.stackHelper.slice.lowerThreshold = valueW;
      this._axialRenderer.stackHelper.slice._stack._windowWidth = valueW;
      this._coronalRenderer.stackHelper.slice._stack._windowWidth = valueW;
      this._sagittalRenderer.stackHelper.slice._stack._windowWidth = valueW;

      if(this.studyStarted){
        this.sliderExploration.setValueW(valueW);
      } else {
        this.sliderPractice.setValueW(valueW);
      }

    } else if (slider === 'sliderC') {
      this.settings.canvas.perspectiveRenderer.stackHelper.slice.lowerThreshold = valueC;
      this._axialRenderer.stackHelper.slice._stack._windowCenter = valueC;
      this._coronalRenderer.stackHelper.slice._stack._windowCenter = valueC;
      this._sagittalRenderer.stackHelper.slice._stack._windowCenter = valueC;

      if(this.studyStarted){
        this.sliderExploration.setValueC(valueC);
      } else {
        this.sliderPractice.setValueC(valueC);
      }
    }

    this._axialRenderer.stackHelper.index = this._axialRenderer.stackHelper.index;
    this._coronalRenderer.stackHelper.index = this._coronalRenderer.stackHelper.index;
    this._sagittalRenderer.stackHelper.index = this._sagittalRenderer.stackHelper.index;

    this.onAxialChanged();
    this.onCoronalChanged();
    this.onSagittalChanged();
  }


  setPerspectiveCameraZoom(args: IOrientation, transitionTime: number) {
    this._perspectiveRenderer.setCameraOrientation(args, transitionTime);
  }

  setPerspectiveCameraOrientation(args: IOrientation, transitionTime: number) {
    this._perspectiveRenderer.setCameraOrientation(args, transitionTime);
  }

  setSliceZoom(sliceZoom: number, sliceOrientation: string, transitionTime: number) {
    if (sliceOrientation === 'axial') {
      this._axialRenderer.setSliceZoom(sliceZoom, transitionTime);
    } else if (sliceOrientation === 'coronal') {
      this._coronalRenderer.setSliceZoom(sliceZoom, transitionTime);
    } else if (sliceOrientation === 'sagittal') {
      this._sagittalRenderer.setSliceZoom(sliceZoom, transitionTime);
    }
  }

  setSliceDrag(slicePosition: ISlicePosition, sliceOrientation: string, transitionTime: number) {
    if (sliceOrientation === 'axial') {
      this._axialRenderer.setSlicePosition(slicePosition, transitionTime);
    } else if (sliceOrientation === 'coronal') {
      this._coronalRenderer.setSlicePosition(slicePosition, transitionTime);
    } else if (sliceOrientation === 'sagittal') {
      this._sagittalRenderer.setSlicePosition(slicePosition, transitionTime);
    }
  }

  setSliceIndex(sliceOrientation: VIEWS, newIndex: number) {
    const renderer = this.getRenderer(sliceOrientation);
    renderer.stackHelper.index = newIndex;
  }

  changeSliceRemove(sliceOrientation: VIEWS, oldIndex: number) {
    if (sliceOrientation === 'axial') {
      this._axialRenderer.removeFromSliceChange(oldIndex, sliceOrientation);
    } else if (sliceOrientation === 'coronal') {
      this._coronalRenderer.removeFromSliceChange(oldIndex, sliceOrientation);
    } else if (sliceOrientation === 'sagittal') {
      this._sagittalRenderer.removeFromSliceChange(oldIndex, sliceOrientation);
    }
  }

  changeSliceRender(sliceOrientation: VIEWS, newIndex: number) {
    if (sliceOrientation === 'axial') {
      this._axialRenderer.renderFromSliceChange(newIndex, sliceOrientation);
    } else if (sliceOrientation === 'coronal') {
      this._coronalRenderer.renderFromSliceChange(newIndex, sliceOrientation);
    } else if (sliceOrientation === 'sagittal') {
      this._sagittalRenderer.renderFromSliceChange(newIndex, sliceOrientation);
    }
  }

  removeArtifact(sliceOrientation: VIEWS, artifact: Artifact) {
    if (sliceOrientation === 'axial') {
      this._axialRenderer.removeArtifact(artifact);
    } else if (sliceOrientation === 'coronal') {
      this._coronalRenderer.removeArtifact(artifact);
    } else if (sliceOrientation === 'sagittal') {
      this._sagittalRenderer.removeArtifact(artifact);
    }
  }

  renderArtifact(sliceOrientation: VIEWS, artifact: Artifact) {
    if (sliceOrientation === 'axial') {
      this._axialRenderer.addArtifact(artifact);
    } else if (sliceOrientation === 'coronal') {
      this._coronalRenderer.addArtifact(artifact);
    } else if (sliceOrientation === 'sagittal') {
      this._sagittalRenderer.addArtifact(artifact);
    }
  }

  deleteArtifact(sliceOrientation: VIEWS, artifact: Artifact) {
    if (sliceOrientation === 'axial') {
      this._axialRenderer.deleteArtifact(artifact);
    } else if (sliceOrientation === 'coronal') {
      this._coronalRenderer.deleteArtifact(artifact);
    } else if (sliceOrientation === 'sagittal') {
      this._sagittalRenderer.deleteArtifact(artifact);
    }
  }


  toggleRulerMode(isEnabled: boolean) {
    [this._coronalRenderer, this._axialRenderer, this._sagittalRenderer].forEach(renderer => {
      renderer.rulerMode = isEnabled;
    });
  }

  toggleAngleMode(isEnabled: boolean) {
    [this._coronalRenderer, this._axialRenderer, this._sagittalRenderer].forEach(renderer => {
      renderer.angleMode = isEnabled;
    });
  }

  // toggleFreehandMode(isEnabled: boolean) {
  //   [this._coronalRenderer, this._axialRenderer, this._sagittalRenderer].forEach(renderer => {
  //     renderer.freehandMode = isEnabled;
  //   });
  // }

  toggleVoxelprobeMode(isEnabled: boolean) {
    [this._coronalRenderer, this._axialRenderer, this._sagittalRenderer].forEach(renderer => {
      renderer.voxelprobeMode = isEnabled;
    });
  }

  toggleAnnotationMode(isEnabled: boolean) {
    [this._coronalRenderer, this._axialRenderer, this._sagittalRenderer].forEach(renderer => {
      renderer.annotationMode = isEnabled;
    });
  }
}
