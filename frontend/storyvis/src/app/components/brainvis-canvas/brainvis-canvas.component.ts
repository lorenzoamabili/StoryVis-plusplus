import * as THREE from 'three';
import * as AMI from 'ami.js';
import * as d3 from 'd3';

import { Component, ElementRef, HostListener, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { IOrientation, ISlicePosition, View } from './utils/types';
import { registerActions } from './provenanceHelpers/provenanceActions';
import { addListeners, setNewAddListeners } from './provenanceHelpers/provenanceListeners';
import { Settings } from './utils/settings';
import { Renderer2D } from './renderer2d';
import { Renderer3D } from './renderer3d';
import { Artifact } from '@visualstorytelling/provenance-core/src/api';
import { ProvenanceService } from '../../shared/_services/provenance.service';
import { StyledSliderPracticeComponent } from '../styled-slider-practice/styled-slider-practice.component';
import { StyledSliderExplorationComponent } from '../styled-slider-exploration/styled-slider-exploration.component';
import html2canvas from 'html2canvas';
import { jsPDF } from "jspdf";
import { ComparisonComponent } from './comparison.component';

export enum VIEWS {
  AXIAL = 'axial',
  SAGITTAL = 'sagittal',
  CORONAL = 'coronal',
  FREEFORM = 'freeform',
  COMPARISON2D = 'axial',
  COMPARISON3D = 'freeform',
  MULTIPLEA1 = 'axial',
  MULTIPLEA2 = 'axial',
  MULTIPLEC1 = 'coronal',
  MULTIPLEC2 = 'coronal',
  MULTIPLES1 = 'sagittal',
  MULTIPLES2 = 'sagittal',
}


@Component({
  selector: 'app-brainvis-canvas',
  templateUrl: './brainvis-canvas.component.html',
  styleUrls: ['./brainvis-canvas.component.css']
})
export class BrainvisCanvasComponent extends THREE.EventDispatcher implements OnInit {
  @Input() studyStarted: boolean;
  @Output() magnificationCreated = new EventEmitter<{ domID: String, oneView: boolean }>();
  @Output() multiplePlanesCreated = new EventEmitter<{ domID: String, sliceOrientation: String, multiplePlanes: boolean }>();
  @Output() navigationVolumeCreated = new EventEmitter<{ sliceOrientation: String, oldIndex: any }>();

  public _initialized = false;
  public settings = Settings.getInstance(this);
  public screenWidth = window.innerWidth;
  public screenHeight = window.innerHeight;
  public datacomicsOpen: boolean;
  public navigationStartIndex: number;
  private stack: any;
  public sliderPractice: StyledSliderPracticeComponent;
  public sliderExploration: StyledSliderExplorationComponent;
  public comparedViews = [];
  public isComparisonMode: boolean = false;
  public comparisonCompositionMade: boolean = false;
  public canvasComparison: ComparisonComponent;
  public elemParent: ElementRef;

  private framesCounter: number = 0;
  private frames: HTMLDivElement[] = [];
  private canvases: HTMLCanvasElement[] = [];
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


  public multiplePlanesViews: View[] = [
    {
      domId: 'r00',

      left: 0.0,
      top: 0.0,
      width: 0.5,
      height: 0.5,

      color: 0x121212,
      sliceOrientation: VIEWS.MULTIPLEA1,
      sliceColor: 0xffffff,
      targetID: 10
    },
    {
      domId: 'r000',

      left: 0.5,
      top: 0.0,
      width: 0.5,
      height: 0.5,

      color: 0x121212,
      sliceOrientation: VIEWS.MULTIPLEA2,
      sliceColor: 0x67a9cf,
      targetID: 11
    },
    {
      domId: 'r22',

      left: 0.0,
      top: 0.0,
      width: 0.5,
      height: 0.5,

      color: 0x121212,
      sliceOrientation: VIEWS.MULTIPLEC1,
      sliceColor: 0xffffff,
      targetID: 12
    },
    {
      domId: 'r222',

      left: 0.5,
      top: 0.0,
      width: 0.5,
      height: 0.5,

      color: 0x121212,
      sliceOrientation: VIEWS.MULTIPLEC2,
      sliceColor: 0x67a9cf,
      targetID: 13
    },
    {
      domId: 'r33',

      left: 0.0,
      top: 0.0,
      width: 0.5,
      height: 0.5,

      color: 0x121212,
      sliceOrientation: VIEWS.MULTIPLES1,
      sliceColor: 0xffffff,
      targetID: 14
    },
    {
      domId: 'r333',

      left: 0.5,
      top: 0.0,
      width: 0.5,
      height: 0.5,

      color: 0x121212,
      sliceOrientation: VIEWS.MULTIPLES2,
      sliceColor: 0x67a9cf,
      targetID: 15
    }
  ];

  private textureTarget: THREE.WebGLRenderTarget;
  private contourHelper: AMI.ContourHelper;
  private contourScene: THREE.Scene;

  public _perspectiveRenderer: Renderer3D;
  public _axialRenderer: Renderer2D;
  public _coronalRenderer: Renderer2D;
  public _sagittalRenderer: Renderer2D;

  public _axialRenderer1: Renderer2D;
  public _coronalRenderer1: Renderer2D;
  public _sagittalRenderer1: Renderer2D;
  public _axialRenderer2: Renderer2D;
  public _coronalRenderer2: Renderer2D;
  public _sagittalRenderer2: Renderer2D;
  public activeRenderers: (Renderer2D | Renderer3D)[];
  public renderersMultiplePlane2D: Renderer2D[];

  // extra variables to show mesh plane intersections in 2D renderers
  private clipPlaneAxial = new THREE.Plane(new THREE.Vector3(0, 0, 0), 0);
  private clipPlaneCoronal = new THREE.Plane(new THREE.Vector3(0, 0, 0), 0);
  private clipPlaneSagittal = new THREE.Plane(new THREE.Vector3(0, 0, 0), 0);

  private clipMultiPlane1 = new THREE.Plane(new THREE.Vector3(0, 0, 0), 0);
  private clipMultiPlane2 = new THREE.Plane(new THREE.Vector3(0, 0, 0), 0);

  public originalParameters = {
    artifactsParam: {
      artifacts: []
    },
    locationParam: {
      slicesPosition: [],
      slicesCameraZoom: [],
      sliceOrientation: {},
      indexes: []
    },
    WLParam: {
      valueW: 350,
      valueC: 50,
      slider: 'both',
      setting: ''
    },
    magnificationParam: false
  }

  constructor(elem: ElementRef, public provenance: ProvenanceService) {
    super();

    registerActions(provenance.registry, this);
    this.settings.canvas = this;
    this.settings._canvas = this;
    this.elemParent = elem;
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
      this._sagittalRenderer,
      this._axialRenderer1,
      this._axialRenderer2,
      this._coronalRenderer1,
      this._coronalRenderer2,
      this._sagittalRenderer1,
      this._sagittalRenderer2
    ];
  }


  get renderers2D() {
    return [
      this._axialRenderer,
      this._coronalRenderer,
      this._sagittalRenderer];
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.activeRenderers.forEach(renderer => {
      // if (renderer.scene.children.length > 0) {
      renderer.onWindowResize();
      // }
    });
  }

  ngOnInit() {
    // todo: remove object from window
    (window as any).canvas = this;

    this._axialRenderer = new Renderer2D(this.views[0]);
    this._perspectiveRenderer = new Renderer3D(this.views[1]);
    this._coronalRenderer = new Renderer2D(this.views[2]);
    this._sagittalRenderer = new Renderer2D(this.views[3]);

    this.activeRenderers = [this._axialRenderer, this._coronalRenderer, this._sagittalRenderer, this._perspectiveRenderer];
    this.activeRenderers.forEach(renderer => renderer.init());
    this.createMultiplePlanes();

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

    addListeners(this.provenance.tracker);
  }

  async resize() {
    this.activeRenderers.forEach(renderer => renderer.onWindowResize());
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
      this.prepareScene(this.renderers2D);

      this.renderers2D.forEach(renderer => this.originalParameters.locationParam.slicesPosition.push(renderer.originalSlicePosition));
      this.renderers2D.forEach(renderer => this.originalParameters.locationParam.slicesCameraZoom.push(renderer.originalCameraZoom));
      this.originalParameters.locationParam.sliceOrientation = this._perspectiveRenderer.getCameraOrientation();
      this.renderers2D.forEach(renderer => this.originalParameters.locationParam.indexes.push(renderer.originalSliceIndex));
      this.presetWindowLevel();

      // event listeners
      this.renderers.forEach(renderer => renderer.addEventListeners());
      this._initialized = true;
      this.resize();
    } catch (error) {
      window.console.log('oops... something went wrong...');
      window.console.log(error);
    }
  }

  removeScene() {
    this.activeRenderers.forEach(renderer => {
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

  prepareScene(renderers: Renderer2D[]) {
    // bounding box
    const boxHelper = new AMI.BoundingBoxHelper(this.stack);
    this._perspectiveRenderer.scene.add(boxHelper);

    // Freeform slice
    this._perspectiveRenderer.initHelpersStack(this.stack);

    renderers.forEach(renderer => {
      renderer.initHelpersStack(this.stack);
      this._perspectiveRenderer.scene.add(renderer.scene);
    });


    // Init render to texture target
    this.textureTarget = new THREE.WebGLRenderTarget(
      renderers[0].domElement.clientWidth,
      renderers[0].domElement.clientHeight,
      {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.NearestFilter,
        format: THREE.RGBAFormat,
      }
    );

    this.contourHelper = new AMI.ContourHelper(this.stack, renderers[0].stackHelper.slice.geometry);
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
    this.activeRenderers.forEach(renderer => renderer.render());
  }

  // setInitValuesWL() {
  // }

  displayOneView(viewID: string) {
    if (!this.settings.isOneView) {
      this.createOneView(viewID);
      this.magnificationCreated.emit({ domID: viewID, oneView: false });
    } else {
      this.removeOneView(viewID);
      this.magnificationCreated.emit({ domID: viewID, oneView: true });
    }
  }


  createOneView(viewID: string) {
    document.getElementById('main').setAttribute('class', 'visualizerOne');

    this.activeRenderers.forEach(renderer => renderer.domElement.setAttribute('style', 'display: none;'));

    document.getElementById(viewID).setAttribute('class', 'rendererOne');
    document.getElementById(viewID).setAttribute('style', 'display: block;');

    this.settings.isOneView = viewID;
  }


  removeOneView(viewID: string) {
    document.getElementById('main').setAttribute('class', 'visualizer');
    document.getElementById(viewID).setAttribute('class', 'renderer');

    this.activeRenderers.forEach(renderer => renderer.domElement.setAttribute('style', 'display: block;'));

    this.settings.isOneView = null;
  }

  compareAnalyses() {
    if (!this.settings.isComparisonMode) {
      this.comparisonSetting();
    } else {
      this.restoreInitialSetting();
    }
    this.settings.isComparisonMode = !this.settings.isComparisonMode;
  }

  restoreGraph(input) {
    this.resetConfig();
    this.provenance.restoreGraph(input);
  }

  restoreGraphEducation(input) {
    this.provenance.restoreGraphEducation(input);
  }

  loadExternalData(input) {
    this.settings.canvasComparison.loadExternalData(input);
  }

  comparisonSetting() {
    document.getElementById('main').setAttribute('class', 'visualizerComparison');
    document.getElementById('r2').setAttribute('style', 'display: none;');
    document.getElementById('r3').setAttribute('style', 'display: none;');
    document.getElementById('r0').setAttribute('class', 'rendererComparison');
    document.getElementById('r1').setAttribute('class', 'rendererComparison');
  }

  restoreInitialSetting() {
    document.getElementById('main').setAttribute('class', 'visualizer');
    document.getElementById('r2').setAttribute('style', 'display: block;');
    document.getElementById('r3').setAttribute('style', 'display: block;');
    document.getElementById('r0').setAttribute('class', 'renderer');
    document.getElementById('r1').setAttribute('class', 'renderer');
  }

  createMultiplePlanes() {
    this._axialRenderer1 = new Renderer2D(this.multiplePlanesViews[0]);
    this._axialRenderer2 = new Renderer2D(this.multiplePlanesViews[1]);
    this._axialRenderer1.init();
    this._axialRenderer2.init();

    this._coronalRenderer1 = new Renderer2D(this.multiplePlanesViews[2]);
    this._coronalRenderer2 = new Renderer2D(this.multiplePlanesViews[3]);
    this._coronalRenderer1.init();
    this._coronalRenderer2.init();

    this._sagittalRenderer1 = new Renderer2D(this.multiplePlanesViews[4]);
    this._sagittalRenderer2 = new Renderer2D(this.multiplePlanesViews[5]);
    this._sagittalRenderer1.init();
    this._sagittalRenderer2.init();
  }

  showMultiplePlanes(viewID: string) {
    if (viewID === 'r0') {
      document.getElementById('r2').setAttribute('class', 'rendererNone');
      document.getElementById('r3').setAttribute('class', 'rendererNone');
      document.getElementById('r00').setAttribute('class', 'renderer');
      document.getElementById('r000').setAttribute('class', 'renderer');

      this.renderersMultiplePlane2D = [this._axialRenderer, this._axialRenderer1, this._axialRenderer2];

    } else if (viewID === 'r2') {
      document.getElementById('r0').setAttribute('class', 'rendererNone');
      document.getElementById('r3').setAttribute('class', 'rendererNone');
      document.getElementById('r22').setAttribute('class', 'renderer');
      document.getElementById('r222').setAttribute('class', 'renderer');

      this.renderersMultiplePlane2D = [this._coronalRenderer, this._coronalRenderer1, this._coronalRenderer2];

    } else if (viewID === 'r3') {
      document.getElementById('r0').setAttribute('class', 'rendererNone');
      document.getElementById('r2').setAttribute('class', 'rendererNone');
      document.getElementById('r33').setAttribute('class', 'renderer');
      document.getElementById('r333').setAttribute('class', 'renderer');

      this.renderersMultiplePlane2D = [this._sagittalRenderer, this._sagittalRenderer1, this._sagittalRenderer2];
    }

    this.activeRenderers = [this.renderersMultiplePlane2D[0], this.renderersMultiplePlane2D[1], this.renderersMultiplePlane2D[2], this._perspectiveRenderer];
    this.settings.multiplePlanesModeOn = true;
  }

  removeMultiplePlanes(viewID: string) {
    if (viewID === 'r0') {
      document.getElementById('r2').setAttribute('class', 'renderer');
      document.getElementById('r3').setAttribute('class', 'renderer');
      document.getElementById('r00').setAttribute('class', 'rendererNone');
      document.getElementById('r000').setAttribute('class', 'rendererNone');

    } else if (viewID === 'r2') {
      document.getElementById('r0').setAttribute('class', 'renderer');
      document.getElementById('r3').setAttribute('class', 'renderer');
      document.getElementById('r22').setAttribute('class', 'rendererNone');
      document.getElementById('r222').setAttribute('class', 'rendererNone');

    } else if (viewID === 'r3') {
      document.getElementById('r0').setAttribute('class', 'renderer');
      document.getElementById('r2').setAttribute('class', 'renderer');
      document.getElementById('r33').setAttribute('class', 'rendererNone');
      document.getElementById('r333').setAttribute('class', 'rendererNone');
    }
    this.renderersMultiplePlane2D = [this._axialRenderer, this._coronalRenderer, this._sagittalRenderer];
    this.settings.multiplePlanesModeOn = false;
  }

  prepareMultipleScenes() {
    this.activeRenderers = [this.renderersMultiplePlane2D[0], this.renderersMultiplePlane2D[1], this.renderersMultiplePlane2D[2], this._perspectiveRenderer];

    this.removeScene();
    this.prepareScene(this.renderersMultiplePlane2D);

    if (this.settings.multiplePlanesModeOn) {
      this.presetWindowLevel();
      this.setSliceIndexMultiplePlanes(this.renderersMultiplePlane2D[0].stackHelper.index, 10);

      // this.activeRenderers.forEach(renderer => renderer.addEventListeners());
      this.animate();
      this.resize();
    }
  }


  multiplePlanes(viewID: string) {
    let sliceOrientation;

    if (!this.settings.multiplePlanesModeOn) {
      this.showMultiplePlanes(viewID);
    } else {
      this.removeMultiplePlanes(viewID);
    }
    this.prepareMultipleScenes();

    if (viewID === 'r0') {
      sliceOrientation = 'axial';
    } else if (viewID === 'r2') {
      sliceOrientation = 'coronal';
    } else if (viewID === 'r3') {
      sliceOrientation = 'sagittal';
    }

    this.multiplePlanesCreated.emit({ domID: viewID, sliceOrientation: sliceOrientation, multiplePlanes: this.settings.multiplePlanesModeOn });
  }


  addFrame(dashboard: any, viewID?: string) {
    const elmId = viewID ? viewID : this.settings.isOneView;
    this.framesCounter = this.framesCounter + 1;

    const frame = document.createElement('div');
    frame.setAttribute('id', 'frame' + this.framesCounter);
    frame.setAttribute('class', 'storytelling-item');
    // frame.setAttribute('style', 'display: flex;');
    const resizerR = document.createElement('div');
    const resizerB = document.createElement('div');
    resizerR.setAttribute('class', 'resizer resizer-r');
    resizerB.setAttribute('class', 'resizer resizer-b');
    frame.appendChild(resizerR);
    frame.appendChild(resizerB);
    document.getElementById(dashboard).appendChild(frame);
    this.frames.push(frame);


    html2canvas(document.getElementById(elmId) as any).then(canvas => {
      canvas.className = 'canvas';
      canvas.id = 'canvas' + this.framesCounter;
      this.canvases.push(canvas);
      frame.appendChild(canvas);
    });
  }

  downloadDashboard() {
    if (this.settings.datacomicsMode) {
      var doc = new jsPDF();
      doc.html(document.getElementById("datacomics") as HTMLElement, {
        callback: function (doc) {
          doc.save();
        },
        width: 100,
        windowWidth: this.screenWidth / 2
      });
    }
  }

  // addState(dashboard: any) {
  //   this.framesCounter = this.framesCounter + 1;

  //   const frame = document.createElement('div');
  //   frame.setAttribute('id', 'frame' + this.framesCounter);
  //   frame.setAttribute('class', 'storytelling-item');
  //   // frame.setAttribute('style', 'display: flex;');
  //   const resizerR = document.createElement('div');
  //   const resizerB = document.createElement('div');
  //   resizerR.setAttribute('class', 'resizer resizer-r');
  //   resizerB.setAttribute('class', 'resizer resizer-b');
  //   frame.appendChild(resizerR);
  //   frame.appendChild(resizerB);
  //   document.getElementById(dashboard).appendChild(frame);
  //   this.frames.push(frame);


  //   html2canvas(document.getElementById('main')).then(canvas => {
  //     canvas.className = 'canvas';
  //     canvas.id = 'canvas' + this.framesCounter;
  //     this.canvases.push(canvas);
  //     frame.appendChild(canvas);
  //   });
  // }

  displayDatacomics() {
    if (this.datacomicsOpen) {
      document.getElementById('main').setAttribute('style', 'display: none;');
      document.getElementById('datacomics').setAttribute('style', 'display: block;')
      this.frames.forEach((frame: any) => frame.setAttribute('style', 'display: block;'));
      const gridFactorX =
        (this.framesCounter < 5) ? 2 :
          (this.framesCounter < 10) ? 3 :
            (this.framesCounter < 17) ? 4 : 5;
      d3.selectAll('.canvas').attr('style', 'width: ' + this.screenWidth / gridFactorX + 'px; height: ' + this.screenWidth / gridFactorX * (this.screenHeight / this.screenWidth) + 'px; padding: 5px 15px; background-color: white;');
      d3.selectAll('.storytelling-item').attr('style', 'width: fit-content; height: fit-content;');
      // d3.selectAll('.textArea').attr('style', 'width: ' + this.screenWidth / 2 + 'px; z-index: 13; font-size: 16px; border-radius: 5px; margin: 50px');
      this.settings.dashboardOn = true;
    } else {
      this.switchToMainView();
      this.settings.dashboardOn = false;
    }
  }

  rearrangeFrames() {
    this.frames.forEach((frame: any) => frame.setAttribute('style', 'position: absolute;'));
    // this.textAreas.forEach((textArea: any) => textArea.setAttribute('style', 'position: absolute; cursor: move; overflow: hidden; z-index: 13; font-size: 16px; border-radius: 5px; height: 100px;'));
    this.frames.forEach((frame: any) => this.dragFrame(frame));
    this.scaleFrames(this.frames);
    this.canvases.forEach((canvas: any) => this.dragFrame(canvas));

    // this.textAreas.forEach((textArea: any) => this.dragFrame(textArea));
    // d3.selectAll('.canvas').attr('style', 'cursor: w-resize; resize: both; position: absolute;').each((x : HTMLCanvasElement) => this.makeResizableDiv(x));
  }

  addTextArea() {
    const textArea = document.createElement('textarea');
    textArea.setAttribute('class', 'textArea');
    textArea.setAttribute('placeholder', 'Add some text to the frame here.');

    if (this.datacomicsOpen) {
      document.getElementById('datacomics').appendChild(textArea);
    }

    this.textAreas.push(textArea);
    textArea.setAttribute('style', 'width: 300px; position: absolute; cursor: move; resize: both; overflow: hidden; z-index: 13; font-size: 16px; border-radius: 5px; height: 100px; top: 0; left: 0;');
    this.dragFrame(textArea);
  }

  switchToMainView() {
    document.getElementById('main').setAttribute('style', 'display: flex;');
    document.getElementById('datacomics').setAttribute('style', 'display: none;');
  }

  clearDashboard() {
    if (this.datacomicsOpen) {
      document.getElementById('datacomics').innerHTML = '';
    }
  }

  dragFrame(frame: any) {
    var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    // The current position of mouse
    let x = 0;
    let y = 0;

    // The dimension of the element
    let w = 0;
    let h = 0;

    frame.onmousedown = dragMouseDown;

    // Query all resizers
    const resizers = frame.querySelectorAll('.resizer');

    // Loop over them
    [].forEach.call(resizers, function (resizer) {
      resizer.addEventListener('mousedown', dragMouseDown);
    });

    function dragMouseDown(e) {
      var evtobj = window.event ? event : e;

      if (evtobj.ctrlKey) {
        const mouseMoveHandler = function (e) {
          // How far the mouse has been moved
          const dx = e.clientX - x;
          const dy = e.clientY - y;

          // Adjust the dimension of element
          frame.style.width = `${w + dx}px`;
          frame.style.height = `${h + dy}px`;
        };

        const mouseUpHandler = function () {
          // Remove the handlers of `mousemove` and `mouseup`
          document.removeEventListener('mousemove', mouseMoveHandler);
          document.removeEventListener('mouseup', mouseUpHandler);
        };

        // Get the current mouse position
        x = e.clientX;
        y = e.clientY;

        // Calculate the dimension of element
        const styles = window.getComputedStyle(frame);
        w = parseInt(styles.width, 10);
        h = parseInt(styles.height, 10);

        // Attach the listeners to `document`
        document.addEventListener('mousemove', mouseMoveHandler);
        document.addEventListener('mouseup', mouseUpHandler);

      } else {

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

  resizeCanvas(canvas: any) {
    // The current position of mouse
    let x = 0;
    let y = 0;

    // The dimension of the element
    let w = 0;
    let h = 0;

    // Query all resizers
    const resizers = canvas.querySelectorAll('.resizer');

    // Loop over them
    [].forEach.call(resizers, function (resizer) {
      resizer.addEventListener('mousedown', dragMouseDown);
    });

    function dragMouseDown(e) {
      const mouseMoveHandler = function (e) {
        // How far the mouse has been moved
        const dx = e.clientX - x;
        const dy = e.clientY - y;

        // Adjust the dimension of element
        canvas.style.width = `${w + dx}px`;
        canvas.style.height = `${h + dy}px`;
      };

      const mouseUpHandler = function () {
        // Remove the handlers of `mousemove` and `mouseup`
        document.removeEventListener('mousemove', mouseMoveHandler);
        document.removeEventListener('mouseup', mouseUpHandler);
      };

      // Get the current mouse position
      x = e.clientX;
      y = e.clientY;

      // Calculate the dimension of element
      const styles = window.getComputedStyle(canvas);
      w = parseInt(styles.width, 10);
      h = parseInt(styles.height, 10);

      // Attach the listeners to `document`
      document.addEventListener('mousemove', mouseMoveHandler);
      document.addEventListener('mouseup', mouseUpHandler);
    }
  }

  disactivateLocalizers() {
    this._axialRenderer.disactivateLocalizers();
    this._coronalRenderer.disactivateLocalizers();
    this._sagittalRenderer.disactivateLocalizers();
    this.settings.localizersOn = false;
  }

  activateLocalizers() {
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

    this._axialRenderer.activateLocalizers();
    this._coronalRenderer.activateLocalizers();
    this._sagittalRenderer.activateLocalizers();

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

  onMulti1Changed() {
    if (this.settings.multiplePlanesModeOn) {
      this.renderersMultiplePlane2D[1].updateClipPlane(this.clipMultiPlane1);
    }
  }

  onMulti2Changed() {
    if (this.settings.multiplePlanesModeOn) {
      this.renderersMultiplePlane2D[2].updateClipPlane(this.clipMultiPlane2);
    }
  }


  // onComparisonChanged() {
  //   this._comparisonRenderer2D1.updateClipPlane(this.clipPlane2D1);
  // }

  // setInitValuesWL() {
  //   // this.settings._thresholdLowerBoundC = (this._axialRenderer.stackHelper.stack.minMax[0]);
  //   // this.settings._thresholdUpperBoundC = (this._axialRenderer.stackHelper.stack.minMax[1]);
  // }


  windowLevelParam(wlSetting) {
    const parameters = {
      valueW: wlSetting.value.width,
      valueC: wlSetting.value.center,
      slider: 'both',
      setting: wlSetting.value.name
    }
    return parameters;
  }


  presetWindowLevel(wlSetting?: any) {
    if (wlSetting) {
      this.originalParameters.WLParam = {
        valueW: this._axialRenderer.stackHelper.slice._stack._windowWidth,
        valueC: this._axialRenderer.stackHelper.slice._stack._windowCenter,
        slider: 'both',
        setting: ''
      }

      this.setWindowLevel(wlSetting.value.width, wlSetting.value.center, 'both');
      const parameters = this.windowLevelParam(wlSetting);

      this.dispatchEvent({
        type: "WLChangeStarted",
        changes: this.originalParameters.WLParam
      });

      this.dispatchEvent({
        type: "WLChanged",
        changes: parameters
      });

      // if (this.settings.isComparisonMode) {
      //   this.settings.canvasComparison.dispatchEvent({
      //     type: "WLChangeStarted",
      //     changes: parameters
      //   });

      //   this.settings.canvasComparison.dispatchEvent({
      //     type: "WLChanged",
      //     changes: this.originalParameters.WLParam
      //   });
      // }

    } else {

      this.setWindowLevel(this.originalParameters.WLParam.valueW, this.originalParameters.WLParam.valueC, 'both');
      // { name: 'chest - mediastinum', width: '350', center: '50' }
    }

  }


  slicesLocationParam() {
    let slicesPosition: ISlicePosition[] = [];
    this.renderers2D.forEach(renderer => slicesPosition.push(renderer.getSlicePosition()));

    let slicesCameraZoom: number[] = [];
    this.renderers2D.forEach(renderer => slicesCameraZoom.push(renderer.camera.zoom));

    let sliceOrientation: IOrientation = this._perspectiveRenderer.getCameraOrientation();

    let indexes: number[] = [];
    this.renderers2D.forEach(renderer => indexes.push(renderer.stackHelper.index));

    const parameters = { slicesPosition, slicesCameraZoom, sliceOrientation, indexes };

    return parameters;
  }

  changeSlicesLocation(parameters) {
    this._axialRenderer.setSlicePosition(parameters.slicesPosition[0], 500);
    this._coronalRenderer.setSlicePosition(parameters.slicesPosition[1], 500);
    this._sagittalRenderer.setSlicePosition(parameters.slicesPosition[2], 500);

    this._axialRenderer.setSliceZoom(parameters.slicesCameraZoom[0], 500);
    this._coronalRenderer.setSliceZoom(parameters.slicesCameraZoom[1], 500);
    this._sagittalRenderer.setSliceZoom(parameters.slicesCameraZoom[2], 500);

    this._perspectiveRenderer.setCameraOrientation(parameters.sliceOrientation, 500);

    this._axialRenderer.stackHelper.index = parameters.indexes[0];
    this._coronalRenderer.stackHelper.index = parameters.indexes[1];
    this._sagittalRenderer.stackHelper.index = parameters.indexes[2];
  }

  deleteArtifacts() {
    this.renderers2D.forEach(renderer => renderer._artifacts.forEach(artifact => renderer.deleteArtifact(artifact)));
  }

  restoreArtifacts(artifacts) {
    if (artifacts) {
      artifacts.forEach(artifact => this.renderArtifact(artifact.sliceOrientation, artifact));
      this.renderers2D.forEach(renderer => renderer.removeFromSliceChange(renderer.stackHelper.index));
    }
  }

  configParam() {
    let artifacts: Artifact[] = [];
    this.renderers2D.forEach(renderer => renderer._artifacts.forEach(artifact => artifacts.push(artifact)));
    const locationParam = this.slicesLocationParam();
    const WLParam = {
      valueW: this._axialRenderer.stackHelper.slice._stack._windowWidth,
      valueC: this._axialRenderer.stackHelper.slice._stack._windowCenter,
      slider: 'both',
      setting: ''
    }
    const magnificationParam = this.settings.isOneView;
    const parameters = { artifacts, locationParam, WLParam, magnificationParam };

    return parameters;
  }


  resetConfig(emit?: boolean) {
    const parameters = this.configParam();
    this.setConfig(this.originalParameters);
    if (this.settings.isComparisonMode) {
      this.settings.canvasComparison.resetConfig();
    }

    if (emit) {
      this.dispatchEvent({
        type: "configChangeStarted",
        changes: parameters
      });

      this.dispatchEvent({
        type: "configChanged",
        changes: this.originalParameters
      });
    }
  }

  setConfig(parameters) {
    this.changeSlicesLocation(parameters.locationParam);
    this.setWindowLevel(parameters.WLParam.valueW, parameters.WLParam.valueC, parameters.WLParam.slider);

    if (parameters.artifacts) {
      this.deleteArtifacts();
    } else {
      this.restoreArtifacts(parameters.artifactsParam.artifacts);
    }

    if (parameters.magnificationParam) {
      this.createOneView(parameters.magnificationParam);
    }

    if (this.settings.localizersOn) {
      this.disactivateLocalizers();
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
      this.settings.defaultSettingW = true;
      this.settings.defaultSettingC = true;

      if (this.studyStarted) {
        this.sliderExploration.setValueW(valueW);
        this.sliderExploration.setValueC(valueC);
      } else {
        this.sliderPractice.setValueW(valueW);
        this.sliderPractice.setValueC(valueC);
      }
    }


    this.renderers2D.forEach(renderer => renderer.stackHelper.index = renderer.stackHelper.index);

    if (this.settings.isComparisonMode) {
      this.settings.canvasComparison._comparisonRenderer2D2.stackHelper.slice._stack._windowWidth = this._axialRenderer.stackHelper.slice._stack._windowWidth;
      this.settings.canvasComparison._comparisonRenderer2D2.stackHelper.slice._stack._windowCenter = this._axialRenderer.stackHelper.slice._stack._windowCenter;
      this.settings.canvasComparison._comparisonRenderer2D2.stackHelper.index = this.settings.canvasComparison._comparisonRenderer2D2.stackHelper.index;
    }

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
    this.onMulti1Changed();
    this.onMulti2Changed();
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

  setSliceIndex(newIndex: number, transitionTime: number, sliceOrientation?: VIEWS) {
    if (this.settings.syncScroll) {
      if (sliceOrientation === 'axial') {
        this.settings.canvasComparison._comparisonRenderer2D2.changeSliceIndex(newIndex, transitionTime);
      }
    }
    if (sliceOrientation === 'axial') {
      this._axialRenderer.changeSliceIndex(newIndex, transitionTime, this._axialRenderer.stackHelper.index);
    } else if (sliceOrientation === 'coronal') {
      this._coronalRenderer.changeSliceIndex(newIndex, transitionTime, this._coronalRenderer.stackHelper.index);
    } else if (sliceOrientation === 'sagittal') {
      this._sagittalRenderer.changeSliceIndex(newIndex, transitionTime, this._sagittalRenderer.stackHelper.index);
    }
  }

  // setMultipleSliceIndex(newIndex: number, domID: string) {
  //   const lowerDelta = this.renderersMultiplePlane2D[0].stackHelper.index - this.renderersMultiplePlane2D[1].stackHelper.index;
  //   const upperDelta = this.renderersMultiplePlane2D[2].stackHelper.index - this.renderersMultiplePlane2D[0].stackHelper.index;

  //   if (this.renderersMultiplePlane2D[0].domElement.id === domID) {
  //     this.renderersMultiplePlane2D[0].stackHelper.index = newIndex;
  //     this.renderersMultiplePlane2D[1].stackHelper.index = newIndex - lowerDelta;
  //     this.renderersMultiplePlane2D[2].stackHelper.index = newIndex + upperDelta;
  //   } else if (this.renderersMultiplePlane2D[1].domElement.id === domID) {
  //     this.renderersMultiplePlane2D[1].stackHelper.index = newIndex;
  //   } else if (this.renderersMultiplePlane2D[2].domElement.id === domID) {
  //     this.renderersMultiplePlane2D[2].stackHelper.index = newIndex;
  //   }
  // }

  setSliceIndexMultiplePlanes(newIndex: number, delta: number) {
    this.renderersMultiplePlane2D[0].stackHelper.index = newIndex;
    this.renderersMultiplePlane2D[1].stackHelper.index = newIndex - delta > 1 ? newIndex - delta : 1;
    this.renderersMultiplePlane2D[2].stackHelper.index = newIndex + delta < this.renderersMultiplePlane2D[2].stackHelper._orientationMaxIndex ? newIndex + delta : this.renderersMultiplePlane2D[2].stackHelper._orientationMaxIndex - 1;
  }

  updateSliceIndexMultiplePlanesMinus(domID: string) {
    if (this.renderersMultiplePlane2D[0].domElement.id === domID) {
      if (this.renderersMultiplePlane2D[1].stackHelper.index - 1 > 1) {
        this.renderersMultiplePlane2D[0].stackHelper.index -= 1;
        this.renderersMultiplePlane2D[1].stackHelper.index -= 1;
        this.renderersMultiplePlane2D[2].stackHelper.index -= 1;
      }
    } else if (this.renderersMultiplePlane2D[1].domElement.id === domID) {
      this.renderersMultiplePlane2D[1].stackHelper.index -= this.renderersMultiplePlane2D[1].stackHelper.index - 1 > 1 ? 1 : 0;
    } else if (this.renderersMultiplePlane2D[2].domElement.id === domID) {
      this.renderersMultiplePlane2D[2].stackHelper.index -= this.renderersMultiplePlane2D[2].stackHelper.index - 1 > this.renderersMultiplePlane2D[0].stackHelper.index ? 1 : 0;
    }
  };

  updateSliceIndexMultiplePlanesPlus(domID: string) {
    if (this.renderersMultiplePlane2D[0].domElement.id === domID) {
      if (this.renderersMultiplePlane2D[2].stackHelper.index + 1 < this.renderersMultiplePlane2D[0].stackHelper._orientationMaxIndex) {
        this.renderersMultiplePlane2D[0].stackHelper.index += 1;
        this.renderersMultiplePlane2D[1].stackHelper.index += 1;
        this.renderersMultiplePlane2D[2].stackHelper.index += 1;
      }
    } else if (this.renderersMultiplePlane2D[1].domElement.id === domID) {
      this.renderersMultiplePlane2D[1].stackHelper.index += this.renderersMultiplePlane2D[1].stackHelper.index + 1 < this.renderersMultiplePlane2D[0].stackHelper.index ? 1 : 0;
    } else if (this.renderersMultiplePlane2D[2].domElement.id === domID) {
      this.renderersMultiplePlane2D[2].stackHelper.index += this.renderersMultiplePlane2D[2].stackHelper.index + 1 < this.renderersMultiplePlane2D[2].stackHelper._orientationMaxIndex ? 1 : 0;
    }
  };



  navigateVolume(sliceOrientation: VIEWS, newIndex: number, transitionTime: number) {
    if (sliceOrientation === 'axial') {
      this.navigationStartIndex = this._axialRenderer.stackHelper.index;
      this._axialRenderer.changeSliceIndex(newIndex, transitionTime, this._axialRenderer.stackHelper.index);
      const oldIndex = this.navigationStartIndex;
      this.navigationVolumeCreated.emit({ sliceOrientation, oldIndex });
    } else if (sliceOrientation === 'coronal') {
      this.navigationStartIndex = this._coronalRenderer.stackHelper.index;
      this._coronalRenderer.changeSliceIndex(newIndex, transitionTime, this._coronalRenderer.stackHelper.index);
      const oldIndex = this.navigationStartIndex;
      this.navigationVolumeCreated.emit({ sliceOrientation, oldIndex });
    } else if (sliceOrientation === 'sagittal') {
      this.navigationStartIndex = this._sagittalRenderer.stackHelper.index;
      this._sagittalRenderer.changeSliceIndex(newIndex, transitionTime, this._sagittalRenderer.stackHelper.index);
      const oldIndex = this.navigationStartIndex;
      this.navigationVolumeCreated.emit({ sliceOrientation, oldIndex});
    }
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

  getIndex(renderer: Renderer2D) {
    if (this._initialized && renderer) {
      if (this.activeRenderers.includes(renderer)) {
        return Math.round(renderer.stackHelper.index);
      }
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
    this.datacomicsOpen = isEnabled;
  }
}

