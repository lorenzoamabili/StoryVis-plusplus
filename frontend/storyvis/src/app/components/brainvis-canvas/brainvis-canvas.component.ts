import * as THREE from 'three';
import * as AMI from 'ami.js';
import * as d3 from 'd3';

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
import html2canvas from 'html2canvas';

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
  @Output() magnificationCreated = new EventEmitter<{ domID: String, oneView: boolean }>();
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
  public screenWidth = window.innerWidth;
  public screenHeight = window.innerHeight;
  public dashboardOpen;
  public datacomicsOpen;
  public scrollytellingOpen;

  private stack: any;
  public sliderPractice: StyledSliderPracticeComponent;
  public sliderExploration: StyledSliderExplorationComponent;

  private framesCounter: number = 0;
  private frames: HTMLDivElement[] = [];
  private textAreas: HTMLTextAreaElement[] = [];

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

    this.settings.datacomicsModeChange.subscribe(this.toggleDatacomicsMode.bind(this));
    this.settings.scrollytellingModeChange.subscribe(this.toggleScrollytellingMode.bind(this));

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
    if (!this.settings.isOneView) {
      this.createOneView(viewID);
      this.magnificationCreated.emit({ domID: viewID, oneView: false });
    } else {
      this.create4Views(viewID);
      this.magnificationCreated.emit({ domID: viewID, oneView: true });
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

    this.settings.isOneView = null;
  }


  addFrame(dashboard: any, viewID?: string) {
    const elmId = viewID ? viewID : this.settings.isOneView;
    this.framesCounter = this.framesCounter + 1;

    const frame = document.createElement('div');
    frame.setAttribute('id', 'frame' + this.framesCounter);
    frame.setAttribute('class', 'storytelling-item');
    // frame.setAttribute('style', 'display: flex;');
    dashboard.appendChild(frame);
    this.frames.push(frame);


    html2canvas(document.getElementById(elmId)).then(canvas => {
      canvas.className = 'canvas';
      canvas.id = 'canvas' + this.framesCounter;
      frame.appendChild(canvas);
    });
  }

  displayScrollytelling() {
    if (this.scrollytellingOpen) {
      document.getElementById('main').setAttribute('style', 'display: none;');
      document.getElementById('scrollytelling').setAttribute('style', 'display: block;');
      // this.frames.forEach((frame: any) => frame.setAttribute('style', 'position: static;'));
      d3.selectAll('.canvas').attr('style', 'width: ' + this.screenWidth / 2 + 'px; height: ' + this.screenWidth / 2 * (this.screenHeight / this.screenWidth) + 'px; padding: 5px 15px; background-color: white;');
      d3.selectAll('.storytelling-item').attr('style', 'width: fit-content; height: fit-content;');
      // d3.selectAll('.textArea').attr('style', 'width: ' + this.screenWidth / 2 + 'px; height: 400px; z-index: 13; font-size: 16px; border-radius: 5px; margin: 50px');
    } else {
      this.switchToMainView();
    }
  }

  displayDatacomics() {
    if (this.datacomicsOpen) {
      document.getElementById('main').setAttribute('style', 'display: none;');
      document.getElementById('datacomics').setAttribute('style', 'display: -webkit-inline-box;')
      this.frames.forEach((frame: any) => frame.setAttribute('style', 'display: block;'));
      const gridFactorX =
        (this.framesCounter < 5) ? 2 :
          (this.framesCounter < 10) ? 3 :
            (this.framesCounter < 17) ? 4 : 5;
      d3.selectAll('.canvas').attr('style', 'width: ' + this.screenWidth / gridFactorX + 'px; height: ' + this.screenWidth / gridFactorX * (this.screenHeight / this.screenWidth) + 'px; padding: 5px 15px; background-color: white;');
      d3.selectAll('.storytelling-item').attr('style', 'width: fit-content; height: fit-content;');
      // d3.selectAll('.textArea').attr('style', 'width: ' + this.screenWidth / 2 + 'px; z-index: 13; font-size: 16px; border-radius: 5px; margin: 50px');
    } else {
      this.switchToMainView();
    }
  }

  rearrangeFrames() {
    this.frames.forEach((frame: any) => frame.setAttribute('style', 'position: absolute; cursor: move;'));
    // this.textAreas.forEach((textArea: any) => textArea.setAttribute('style', 'position: absolute; cursor: move; overflow: hidden; z-index: 13; font-size: 16px; border-radius: 5px; height: 100px;'));
    this.frames.forEach((frame: any) => this.dragFrame(frame));
    this.scaleFrames(this.frames);


    // this.textAreas.forEach((textArea: any) => this.dragFrame(textArea));
    // d3.selectAll('.canvas').attr('style', 'cursor: w-resize; resize: both; position: absolute;').each((x : HTMLCanvasElement) => this.makeResizableDiv(x));
  }

  addTextArea() {
    const textArea = document.createElement('textarea');
    textArea.setAttribute('class', 'textArea');
    textArea.setAttribute('placeholder', 'Add some text to the frame here.');

    if (this.datacomicsOpen) {
      document.getElementById('datacomics').appendChild(textArea);
    } else if (this.scrollytellingOpen) {
      document.getElementById('scrollytelling').appendChild(textArea);
    }

    this.textAreas.push(textArea);
    textArea.setAttribute('style', 'width: 300px; position: absolute; cursor: move; resize: both; overflow: hidden; z-index: 13; font-size: 16px; border-radius: 5px; height: 100px; top: 0; left: 0;');
    this.dragFrame(textArea);
  }

  switchToMainView() {
    document.getElementById('main').setAttribute('style', 'display: flex;');
    document.getElementById('datacomics').setAttribute('style', 'display: none;');
    document.getElementById('scrollytelling').setAttribute('style', 'display: none;');
  }

  clearDashboard() {
    if (this.datacomicsOpen) {
      document.getElementById('datacomics').innerHTML = '';
    } else if (this.scrollytellingOpen) {
      document.getElementById('scrollytelling').innerHTML = '';
    }
  }

  dragFrame(frame: any) {
    var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    frame.onmousedown = dragMouseDown;

    function dragMouseDown(e) {
      var evtobj = window.event ? event : e;

      if (evtobj.ctrlKey) {
        e = e || window.event;
        e.preventDefault();

        // get the mouse cursor position at startup:
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        // call a function whenever the cursor moves:
        document.onmousemove = elementDrag;
      }
    }

    function elementDrag(e) {
      e = e || window.event;
      e.preventDefault();

      // calculate the new cursor position:
      pos1 = pos3 - e.clientX;
      pos2 = pos4 - e.clientY;
      pos3 = e.clientX;
      pos4 = e.clientY;
      // set the element's new position:
      frame.style.top = (frame.offsetTop - pos2) + 'px';
      frame.style.left = (frame.offsetLeft - pos1) + 'px';
    }

    function closeDragElement() {
      // stop moving when mouse button is released:
      document.onmouseup = null;
      document.onmousemove = null;
    }
  }

  scaleFrames(contents: HTMLDivElement[]) {
    var zX = 1;
    window.addEventListener('wheel', (e) => {
      var dir;
      dir = (e.deltaY > 0) ? 0.1 : -0.1;
      zX += dir;
      // if (e.altKey) {
      //   var x = e.clientX, y = e.clientY,
      //     elementMouseIsOver = document.elementFromPoint(x, y) as HTMLDivElement;
      //   elementMouseIsOver.style.transform = 'scale(' + zX + ')';
      //   return;
      // } else 
      if (e.ctrlKey) {
        for (var i = 0; i < contents.length; i++) {
          contents[i].style.transform = 'scale(' + zX + ')';
        }
      }
      // e.preventDefault();
      return;
    });
  }

  removeLocalizers() {
    this._axialRenderer.removeLocalizers();
    this._coronalRenderer.removeLocalizers();
    this._sagittalRenderer.removeLocalizers();
    this.settings.localizersOn = false;
  }

  createLocalizers() {
    // create new mesh with Localizer shaders
    const plane1 = this._axialRenderer.stackHelper.slice.cartesianEquation();
    const plane2 = this._coronalRenderer.stackHelper.slice.cartesianEquation();
    const plane3 = this._sagittalRenderer.stackHelper.slice.cartesianEquation();
    // localizer axial slice
    this._axialRenderer.initHelpersLocalizer(this.stack, plane1, [
      { plane: plane2, color: new THREE.Color(this._coronalRenderer.stackHelper.borderColor) },
      { plane: plane3, color: new THREE.Color(this._sagittalRenderer.stackHelper.borderColor) },
    ]);

    // localizer coronal slice
    this._coronalRenderer.initHelpersLocalizer(this.stack, plane2, [
      { plane: plane1, color: new THREE.Color(this._axialRenderer.stackHelper.borderColor) },
      { plane: plane3, color: new THREE.Color(this._sagittalRenderer.stackHelper.borderColor) },
    ]);

    // localizer sagittal slice
    this._sagittalRenderer.initHelpersLocalizer(this.stack, plane3, [
      { plane: plane1, color: new THREE.Color(this._axialRenderer.stackHelper.borderColor) },
      { plane: plane2, color: new THREE.Color(this._coronalRenderer.stackHelper.borderColor) },
    ]);
    this.settings.localizersOn = true;
  }

  onAxialChanged() {
    this._axialRenderer.updateLocalizer([this._coronalRenderer.localizerHelper, this._sagittalRenderer.localizerHelper]);
    this._axialRenderer.updateClipPlane(this.clipPlaneAxial);
    if (this.contourHelper) {
      this.contourHelper.geometry = this._axialRenderer.stackHelper.slice.geometry;
    }
  }

  onCoronalChanged() {
    this._coronalRenderer.updateLocalizer([this._axialRenderer.localizerHelper, this._sagittalRenderer.localizerHelper]);
    this._coronalRenderer.updateClipPlane(this.clipPlaneCoronal);
  }

  onSagittalChanged() {
    this._sagittalRenderer.updateLocalizer([this._axialRenderer.localizerHelper, this._coronalRenderer.localizerHelper]);
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
    this._axialRenderer.setSlicePosition(parameters.slicesPosition[0], 500);
    this._coronalRenderer.setSlicePosition(parameters.slicesPosition[1], 500);
    this._sagittalRenderer.setSlicePosition(parameters.slicesPosition[2], 500);

    this._axialRenderer.setSliceZoom(parameters.slicesCameraZoom[0], 500);
    this._coronalRenderer.setSliceZoom(parameters.slicesCameraZoom[1], 500);
    this._sagittalRenderer.setSliceZoom(parameters.slicesCameraZoom[2], 500);

    this._perspectiveRenderer.setCameraOrientation(parameters.sliceOrientation, 500)
  }

  deleteArtifacts() {
    this.renderers2D.forEach(renderer => renderer._artifacts.forEach(artifact => renderer.deleteArtifact(artifact)));
  }

  restoreArtifacts(artifacts) {
    if (artifacts) {
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

  adjustLocalizersOnDoubleClick(ijk: any) {
    this._axialRenderer.stackHelper.index = ijk.getComponent((this._axialRenderer.stackHelper.orientation + 2) % 3);
    this._coronalRenderer.stackHelper.index = ijk.getComponent((this._coronalRenderer.stackHelper.orientation + 2) % 3);
    this._sagittalRenderer.stackHelper.index = ijk.getComponent((this._sagittalRenderer.stackHelper.orientation + 2) % 3);

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

  setSliceIndex(sliceOrientation: VIEWS, newIndex: number, transitionTime: number) {
    if (sliceOrientation === 'axial') {
      this._axialRenderer.changeSliceIndex(newIndex, transitionTime);
    } else if (sliceOrientation === 'coronal') {
      this._coronalRenderer.changeSliceIndex(newIndex, transitionTime);
    } else if (sliceOrientation === 'sagittal') {
      this._sagittalRenderer.changeSliceIndex(newIndex, transitionTime);
    }
  }


  navigateVolume(sliceOrientation: VIEWS, newIndex: number, transitionTime: number) {
    console.log(this._axialRenderer.stackHelper.index);
    // this.renderAllArtifacts(sliceOrientation);
    if (sliceOrientation === 'axial') {
      this._axialRenderer.setSliceIndex(this._axialRenderer.stackHelper.index, newIndex, transitionTime);
    } else if (sliceOrientation === 'coronal') {
      this._coronalRenderer.setSliceIndex(this._coronalRenderer.stackHelper.index, newIndex, transitionTime);
    } else if (sliceOrientation === 'sagittal') {
      this._sagittalRenderer.setSliceIndex(this._sagittalRenderer.stackHelper.index, newIndex, transitionTime);
    }
    // this.removeAllArtifacts(sliceOrientation);
  }


  renderAllArtifacts(sliceOrientation: VIEWS) {
    let index = 0;
    if (sliceOrientation === 'axial') {
      for (let i = 0; i < this._axialRenderer.stackHelper._orientationMaxIndex - 1; i++) {
        index = index + 1;
        this._axialRenderer.renderFromSliceChange(index);
      }
    } else if (sliceOrientation === 'coronal') {
      for (let i = 0; i < this._coronalRenderer.stackHelper._orientationMaxIndex - 1; i++) {
        index = index + 1;
        this._coronalRenderer.renderFromSliceChange(index);
      }
    } else if (sliceOrientation === 'sagittal') {
      for (let i = 0; i < this._sagittalRenderer.stackHelper._orientationMaxIndex - 1; i++) {
        index = index + 1;
        this._sagittalRenderer.renderFromSliceChange(index);
      }
    }
  }

  // setSliceIndex(sliceOrientation: VIEWS, newIndex: number) {
  //   const renderer = this.getRenderer(sliceOrientation);
  //   renderer.stackHelper.index = newIndex;
  // }

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



  renderMeasurements(artifacts) {
    artifacts.forEach(artifact => this.renderArtifact(artifact.sliceOrientation, artifact));
    this.renderers2D.forEach(renderer => artifacts.forEach(artifact => renderer.renderFromSliceChange(artifact.sliceIndex)));
  }

  removeMeasurements(artifacts) {
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
    this.renderers2D.forEach(renderer => renderer.rulerMode = isEnabled)
  };

  toggleAngleMode(isEnabled: boolean) {
    this.renderers2D.forEach(renderer => renderer.angleMode = isEnabled)
  };

  // toggleFreehandMode(isEnabled: boolean) {
  //   this.renderers2D.forEach(renderer => renderer.freehandMode = isEnabled)
  // };

  toggleVoxelprobeMode(isEnabled: boolean) {
    this.renderers2D.forEach(renderer => renderer.voxelprobeMode = isEnabled)
  };

  toggleAnnotationMode(isEnabled: boolean) {
    this.renderers2D.forEach(renderer => renderer.annotationMode = isEnabled)
  };

  toggleDatacomicsMode(isEnabled: boolean) {
    this.dashboardOpen = isEnabled;
    this.datacomicsOpen = isEnabled;
  }

  toggleScrollytellingMode(isEnabled: boolean) {
    this.dashboardOpen = isEnabled;
    this.scrollytellingOpen = isEnabled;
  }
}

