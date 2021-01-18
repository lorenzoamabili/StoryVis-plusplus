import * as THREE from 'three';
import * as AMI from 'ami.js';

import {
  Component, ElementRef, HostListener, OnInit, Input, EventEmitter, Output,
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
  @Output() nullCreated = new EventEmitter<any>();
  @Output() slicesLocationCreated = new EventEmitter<{ slicesPosition: ISlicePosition[], slicesCameraZoom: number[] }>();
  @Output() resetWLCreated = new EventEmitter<{ valueW: any, valueC: any, slider: string, setting: string }>();
  @Output() resetConfigCreated = new EventEmitter<{
    artifacts: Artifact[],
    locationParam: {
      doArgs: {
        slicesPosition: ISlicePosition[];
        slicesCameraZoom: number[];
        sliceOrientation: IOrientation;
      };
      undoArgs: {
        slicesPosition: ISlicePosition[];
        slicesCameraZoom: number[];
        sliceOrientation: IOrientation;
      };
    },
    WLParam: {
      valueW: any;
      valueC: any;
      slider: string;
      setting: string;
    },
    magnificationParam: string;
  }>();

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

  private oldStackDragA: ISlicePosition;
  private oldStackDragC: ISlicePosition;
  private oldStackDragS: ISlicePosition;
  private oldStackZoomA: number;
  private oldStackZoomC: number;
  private oldStackZoomS: number;

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

  get renderers2D() {
    return [
      this._axialRenderer,
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
    (window as any).canvas = this;

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
      this.resetWindowLevel1();

      this._perspectiveRenderer.originalSliceOrientation = this._perspectiveRenderer.getCameraOrientation();

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


    if (this.settings.isOneView === '') {

      this.oldStackDragA = this._axialRenderer.getSlicePosition();
      this.oldStackDragC = this._coronalRenderer.getSlicePosition();
      this.oldStackDragS = this._sagittalRenderer.getSlicePosition();

      this.oldStackZoomA = this._axialRenderer.camera.zoom;
      this.oldStackZoomC = this._coronalRenderer.camera.zoom;
      this.oldStackZoomS = this._sagittalRenderer.camera.zoom;

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


    if (this.settings.isOneView === '') {
      this.setSliceDrag(this.oldStackDragA, VIEWS.AXIAL, 10);
      this.setSliceDrag(this.oldStackDragC, VIEWS.CORONAL, 10);
      this.setSliceDrag(this.oldStackDragS, VIEWS.SAGITTAL, 10);

      this.setSliceZoom(this.oldStackZoomA, VIEWS.AXIAL, 10);
      this.setSliceZoom(this.oldStackZoomC, VIEWS.CORONAL, 10);
      this.setSliceZoom(this.oldStackZoomS, VIEWS.SAGITTAL, 10);
    }

  }


  createOneView(viewID: string) {
    document.getElementById('main').setAttribute('class', 'visualizerOne');

    this.renderers.forEach(renderer => renderer.domElement.setAttribute('style', 'display: none;'));

    document.getElementById(viewID).setAttribute('class', 'rendererOne');
    document.getElementById(viewID).setAttribute('style', 'display: block;');

    this.settings.isOneView = viewID;
  }


  create4Views(viewID: string) {
    document.getElementById('main').setAttribute('class', 'visualizer');
    document.getElementById(viewID).setAttribute('class', 'renderer');

    this.renderers.forEach(renderer => renderer.domElement.setAttribute('style', 'display: block;'));

    this.settings.isOneView = '';
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


  resetWindowLevelParam(setting?: string) {
    const parameters = {
      valueW: this.studyStarted ? this.sliderExploration.getValueW() : this.sliderPractice.getValueW(),
      valueC: this.studyStarted ? this.sliderExploration.getValueC() : this.sliderPractice.getValueC(),
      slider: 'both',
      setting: setting ? setting : '1'
    }
    return parameters;
  }

  resetWindowLevel(setting?: string) {
    const parameters = this.resetWindowLevelParam(setting);

    if (parameters.setting === '1') {
      this.resetWindowLevel1();
    } else if (setting === '2') {
      this.resetWindowLevel2();
    }

    if (setting !== 'reset') {
      this.resetWLCreated.emit(parameters);
    }
  }

  resetWindowLevel1() {
    this.setWindowLevel(1500, 600, 'both');
  }

  resetWindowLevel2() {
    this.setWindowLevel(350, 50, 'both');
  }



  resetSlicesLocationParam() {
    let slicesPosition: ISlicePosition[] = [];
    this.renderers2D.forEach(renderer => slicesPosition.push(renderer.getSlicePosition()));

    let slicesCameraZoom: number[] = [];
    this.renderers2D.forEach(renderer => slicesCameraZoom.push(renderer.camera.zoom));

    let sliceOrientation: IOrientation = this._perspectiveRenderer.getCameraOrientation();

    const undoArgs = { slicesPosition, slicesCameraZoom, sliceOrientation };


    slicesPosition = [];
    this.renderers2D.forEach(renderer => slicesPosition.push(renderer.originalSlicePosition));

    slicesCameraZoom = [];
    this.renderers2D.forEach(renderer => slicesCameraZoom.push(renderer.originalCameraZoom));

    sliceOrientation = this._perspectiveRenderer.originalSliceOrientation;

    const doArgs = { slicesPosition, slicesCameraZoom, sliceOrientation };


    const parameters = { doArgs, undoArgs };

    return parameters;
  }


  resetSlicesLocation() {
    const parameters = this.resetSlicesLocationParam();
    this.changeSlicesLocation(parameters.doArgs);
    this.slicesLocationCreated.emit(parameters.undoArgs);
    this.provenance.graph.current.metadata.option = 'reset';
  }

  changeSlicesLocation(parameters) {
    this._axialRenderer.setSlicePosition(parameters.slicesPosition[0], 10);
    this._coronalRenderer.setSlicePosition(parameters.slicesPosition[1], 10);
    this._sagittalRenderer.setSlicePosition(parameters.slicesPosition[2], 10);

    this._axialRenderer.setSliceZoom(parameters.slicesCameraZoom[0], 10);
    this._coronalRenderer.setSliceZoom(parameters.slicesCameraZoom[1], 10);
    this._sagittalRenderer.setSliceZoom(parameters.slicesCameraZoom[2], 10);

    this._perspectiveRenderer.setCameraOrientation(parameters.sliceOrientation, 10)
  }

  deleteArtifacts() {
    this.renderers2D.forEach(renderer => renderer._artifacts.forEach(artifact => renderer.deleteArtifact(artifact)));
  }

  restoreArtifacts(artifacts) {
    if(artifacts){
      artifacts.forEach(artifact => this.renderArtifact(artifact.sliceOrientation, artifact));
      this.renderers2D.forEach(renderer => artifacts.forEach(artifact => renderer.renderFromSliceChange(artifact.sliceIndex)));
    }
  }

  resetConfigParam() {
    let artifacts: Artifact[] = []; 
    this.renderers2D.forEach(renderer => renderer._artifacts.forEach(artifact => artifacts.push(artifact)));
    const locationParam = this.resetSlicesLocationParam();
    const WLParam = this.resetWindowLevelParam();
    const magnificationParam = this.settings.isOneView;
    const parameters = { artifacts, locationParam, WLParam, magnificationParam };

    return parameters;
  }

  resetConfig(newRoot?: boolean) {
    const parameters = this.resetConfigParam();

    this.deleteArtifacts();
    this.changeSlicesLocation(parameters.locationParam.doArgs);
    this.resetWindowLevel('reset');

    if (parameters.magnificationParam) {
      this.create4Views(parameters.magnificationParam);
    }

    if (newRoot) {
      this.resetConfigCreated.emit(parameters);
    }
  }

  setConfig(parameters) {
    this.restoreArtifacts(parameters.artifacts);
    this.changeSlicesLocation(parameters.locationParam.undoArgs);
    this.setWindowLevel(parameters.WLParam.valueW, parameters.WLParam.valueC, parameters.WLParam.slider);
    if (parameters.magnificationParam) {
      this.createOneView(parameters.magnificationParam);
    }
  }


  setWindowLevel(valueW, valueC, slider) {
    if (slider === 'sliderW') {
      this.renderers2D.forEach(renderer => renderer.stackHelper.slice._stack._windowWidth = valueW);

      if (this.studyStarted) {
        this.sliderExploration.setValueW(valueW);
      } else {
        this.sliderPractice.setValueW(valueW);
      }

    } else if (slider === 'sliderC') {
      this.renderers2D.forEach(renderer => renderer.stackHelper.slice._stack._windowCenter = valueC);

      if (this.studyStarted) {
        this.sliderExploration.setValueC(valueC);
      } else {
        this.sliderPractice.setValueC(valueC);
      }

    } else if (slider === 'both') {
      this.settings.automaticSettingW = true;
      this.settings.automaticSettingC = true;

      if (this.studyStarted) {
        this.sliderExploration.setValueW(valueW);
        this.sliderExploration.setValueC(valueC);
      } else {
        this.sliderPractice.setValueW(valueW);
        this.sliderPractice.setValueC(valueC);
      }
    }

    this.renderers2D.forEach(renderer => renderer.stackHelper.index = renderer.stackHelper.index);

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
      this._axialRenderer.removeFromSliceChange(oldIndex);
    } else if (sliceOrientation === 'coronal') {
      this._coronalRenderer.removeFromSliceChange(oldIndex);
    } else if (sliceOrientation === 'sagittal') {
      this._sagittalRenderer.removeFromSliceChange(oldIndex);
    }
  }

  changeSliceRender(sliceOrientation: VIEWS, newIndex: number) {
    if (sliceOrientation === 'axial') {
      this._axialRenderer.renderFromSliceChange(newIndex);
    } else if (sliceOrientation === 'coronal') {
      this._coronalRenderer.renderFromSliceChange(newIndex);
    } else if (sliceOrientation === 'sagittal') {
      this._sagittalRenderer.renderFromSliceChange(newIndex);
    }
  }

  renderMeasurements(artifacts){
    artifacts.forEach(artifact => this.renderArtifact(artifact.sliceOrientation, artifact));
    this.renderers2D.forEach(renderer => artifacts.forEach(artifact => renderer.renderFromSliceChange(artifact.sliceIndex)));
  }

  removeMeasurements(artifacts){
    this.renderers2D.forEach(renderer => artifacts.forEach(artifact => renderer.removeFromSliceChange(artifact.sliceIndex)));
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

