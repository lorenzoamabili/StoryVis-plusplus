import * as THREE from 'three';
import * as AMI from 'ami.js';
import * as d3 from 'd3';

import {
  Component, ElementRef, HostListener, OnInit, Input, EventEmitter, Output
} from '@angular/core';
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
import { VIEWS } from './brainvis-canvas.component';


@Component({
  selector: 'app-brainvis-canvas-comparison',
  templateUrl: './comparison.component.html',
  styleUrls: ['./comparison.component.css']
})


export class ComparisonComponent extends THREE.EventDispatcher implements OnInit {
  @Input() studyStarted: boolean;
  @Output() magnificationCreated = new EventEmitter<{ domID: String, oneView: boolean }>();
  @Output() multiplePlanesCreated = new EventEmitter<{ domID: String, multiplePlanes: boolean }>();
  @Output() navigationVolumeCreated = new EventEmitter<{ sliceOrientation: String, newIndex: number }>();

  public _initialized = false;
  public settings = Settings.getInstance(this);
  public screenWidth = window.innerWidth;
  public screenHeight = window.innerHeight;
  public datacomicsOpen;

  public data;
  public navigationStartIndex: number;

  private stack: any;
  public sliderPractice: StyledSliderPracticeComponent;
  public sliderExploration: StyledSliderExplorationComponent;
  public comparedViews = [];
  public comparisonCompositionMade: boolean = false;
  public canvasComparison: ComparisonComponent;
  public elemParent: ElementRef;

  private framesCounter: number = 0;
  private frames: HTMLDivElement[] = [];
  private textAreas: HTMLTextAreaElement[] = [];

  private elem: Element;
  public comparisonViews: View[] = [
    { 
      domId: 'c1',

      left: 0.0,
      top: 0.0,
      width: 1.0,
      height: 0.5,

      color: 0x121212,
      sliceOrientation: VIEWS.COMPARISON2D,
      sliceColor: 0x06a0ff,
      targetID: 6
    },
    {
      domId: 'c3',

      left: 0.5,
      top: 0.0,
      width: 1.0,
      height: 0.5,

      color: 0x121212,
      sliceOrientation: VIEWS.COMPARISON3D,
      sliceColor: 0x06a0ff,
      targetID: 7
    }
  ];


  public originalParameters = {
    artifactsParam: {
      artifacts: []
    },
    locationParam: {
      slicesPosition: {},
      slicesCameraZoom: {},
      sliceOrientation: {},
      index: {}
    },
    WLParam: {
      valueW: 350,
      valueC: 50,
      slider: 'both',
      setting: ''
    },
    magnificationParam: false
  }

  private textureTarget: THREE.WebGLRenderTarget;
  private contourHelper: AMI.ContourHelper;
  private contourScene: THREE.Scene;

  public _comparisonRenderer2D2: Renderer2D;
  public _comparisonRenderer3D2: Renderer3D;

  private clipPlane2D2 = new THREE.Plane(new THREE.Vector3(0, 0, 0), 0);

  constructor(elem: ElementRef, public provenance: ProvenanceService) {
    super();
    this.elemParent = elem;
    this.settings.canvasComparison = this;
    this.settings._canvas = this;
  }

  get perspectiveRenderer() {
    return this._comparisonRenderer3D2;
  }

  get initialized() {
    return this._initialized;
  }

  get renderers() {
    return [
      this._comparisonRenderer2D2,
      this._comparisonRenderer3D2
    ];
  }

  get renderers2D() {
    return [
      this._comparisonRenderer2D2
    ];
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.renderers.forEach(renderer => {
      // if (renderer.scene.children.length > 0) {
        renderer.onWindowResize();
      // }
    });
  }

  ngOnInit() {
    // todo: remove object from window
    (window as any).canvasComparison = this;

    this._comparisonRenderer2D2 = new Renderer2D(this.comparisonViews[0]);
    this._comparisonRenderer3D2 = new Renderer3D(this.comparisonViews[1]);
    this._comparisonRenderer2D2.init();
    this._comparisonRenderer3D2.init();

    // this.loadData((this.studyStarted) ?
    //   // 'https://glcdn.githack.com/lorenzo.amabili/dicomdatalab/raw/master/data/prova1.nii.gz' : 
    //   'https://rawcdn.githack.com/lorenzoamabili/DICOMdata/1596c8cf93a5505166375daf67c9d450e0f3bbda/data/prova1.nii.gz' :
    //   'https://rawcdn.githack.com/VisualStorytelling/data/94dd382a51958824eb6bf4cf529f5b7bce383f99/fnndsc/adi_brain.nii.gz');

    // this.addEventListeners();

    this.settings.rulerModeChange.subscribe(this.toggleRulerMode.bind(this));
    this.settings.angleModeChange.subscribe(this.toggleAngleMode.bind(this));
    // this.settings.freehandModeChange.subscribe(this.toggleFreehandMode.bind(this));
    this.settings.voxelprobeModeChange.subscribe(this.toggleVoxelprobeMode.bind(this));
    this.settings.annotationModeChange.subscribe(this.toggleAnnotationMode.bind(this));

    this.settings.datacomicsModeChange.subscribe(this.toggleDatacomicsMode.bind(this));
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
      this.prepareCamera(this._comparisonRenderer3D2);
      this.prepareScene(this._comparisonRenderer2D2);

      this.originalParameters.locationParam = {
        slicesPosition: this._comparisonRenderer2D2.originalSlicePosition,
        slicesCameraZoom: this._comparisonRenderer2D2.camera.zoom,
        sliceOrientation: this._comparisonRenderer3D2.getCameraOrientation(),
        index: this._comparisonRenderer2D2.stackHelper.index
      }
      this._comparisonRenderer2D2.stackHelper.slice._stack._windowWidth = this.settings.canvas._axialRenderer.stackHelper.slice._stack._windowWidth;
      this._comparisonRenderer2D2.stackHelper.slice._stack._windowCenter = this.settings.canvas._axialRenderer.stackHelper.slice._stack._windowCenter;
      this._comparisonRenderer2D2.stackHelper.index = this._comparisonRenderer2D2.stackHelper.index;

      // event listeners
      this.renderers.forEach(renderer => renderer.addEventListeners());
      this._initialized = true;
      this.settings.canvasComparison = this;
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
    this._comparisonRenderer3D2.scene.add(boxHelper);

    // Freeform slice
    this._comparisonRenderer3D2.initHelpersStack(this.stack);
    this._comparisonRenderer2D2.initHelpersStack(this.stack);
    this._comparisonRenderer3D2.scene.add(this._comparisonRenderer2D2.scene);


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


  loadExternalData(input){
    this.provenance.newGraphComparison();
    this.loadData(input.value.url);
    
    // this.addEventListeners();
    this.animate();
    registerActions(this.provenance.registryComparison, this);
    addListeners(this.provenance.trackerComparison, this);
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
    document.getElementById(dashboard).appendChild(frame);
    this.frames.push(frame);


    html2canvas(document.getElementById(elmId)).then(canvas => {
      canvas.className = 'canvas';
      canvas.id = 'canvas' + this.framesCounter;
      frame.appendChild(canvas);
    });
  }

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



  onAxialChanged() {
    this._comparisonRenderer2D2.updateClipPlane(this.clipPlane2D2);
    if (this.contourHelper) {
      this.contourHelper.geometry = this._comparisonRenderer2D2.stackHelper.slice.geometry;
    }
  }
  onCoronalChanged() {
  }
  onSagittalChanged() {
  }
  onMulti1Changed() {
  }
  onMulti2Changed() {
  }
  adjustLocalizersOnDoubleClick(ijk: any) {
  }
  multiplePlanes(){
  }


  windowLevelParam(wlSetting) {
    const parameters = {
      valueW: wlSetting.value.width,
      valueC: wlSetting.value.center,
      slider: 'both',
      setting: wlSetting.value.name
    }
    return parameters;
  }

  // presetWindowLevel(wlSetting?: any) {
  //   this.settings.canvas.presetWindowLevel(wlSetting);
  // }


  setWindowLevel(valueW, valueC, slider) {
    this.settings.canvas.setWindowLevel(valueW, valueC, slider);
  }

  
  // onComparisonChanged() {
  //   this._comparisonRenderer1.updateClipPlane(this.clipPlaneComparison1);
  //   this._comparisonRenderer2.updateClipPlane(this.clipPlaneComparison2);
  //   this._comparisonRenderer3.updateClipPlane(this.clipPlaneComparison3);
  //   this._comparisonRenderer4.updateClipPlane(this.clipPlaneComparison4);
  // }


  // setInitValuesWL() {
  //   // this.settings._thresholdLowerBoundC = (this._comparisonRenderer2D2.stackHelper.stack.minMax[0]);
  //   // this.settings._thresholdUpperBoundC = (this._comparisonRenderer2D2.stackHelper.stack.minMax[1]);
  // }


  // resetWindowLevelParam(wlSettingName) {
  //   const parameters = {
  //     valueW: this.studyStarted ? this.sliderExploration.getValueW() : this.sliderPractice.getValueW(),
  //     valueC: this.studyStarted ? this.sliderExploration.getValueC() : this.sliderPractice.getValueC(),
  //     slider: 'both',
  //     setting: wlSettingName
  //   }
  //   return parameters;
  // }

  // presetWindowLevel(wlSetting?: any) {
  //   if (!wlSetting) {
  //     const parameters = this.resetWindowLevelParam('head - soft tissues');
  //     this.setWindowLevel(parameters.valueW, parameters.valueC, parameters.slider);
  //   } else {
  //     const parameters = this.resetWindowLevelParam(wlSetting.value.name);
  //     this.setWindowLevel(wlSetting.value.width, wlSetting.value.center, 'both');
  //     this.resetWLCreated.emit(parameters);
  //   }
  // }



  changeSlicesLocation(parameters) {
    this._comparisonRenderer2D2.setSlicePosition(parameters.slicesPosition, 500);
    this._comparisonRenderer2D2.setSliceZoom(parameters.slicesCameraZoom, 500);
    this._comparisonRenderer2D2.stackHelper.index = parameters.index;

    this._comparisonRenderer3D2.setCameraOrientation(parameters.sliceOrientation, 500);
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


  resetConfig() {
    this.setConfig(this.originalParameters);
  }

  setConfig(parameters) {
    this.changeSlicesLocation(parameters.locationParam);
    this.setWindowLevel(parameters.WLParam.valueW, parameters.WLParam.valueC, parameters.WLParam.slider);

    if(parameters.artifacts){
      this.deleteArtifacts();
    } else {
      this.restoreArtifacts(parameters.artifactsParam.artifacts);
    }

    if (parameters.magnificationParam) {
      this.createOneView(parameters.magnificationParam);
    }
  }


  // setWindowLevel(valueW, valueC, slider) {
  //   if (slider === 'sliderW') {
  //     this.renderers2D.forEach(renderer => renderer.stackHelper.slice._stack._windowWidth = valueW);

  //     if (this.studyStarted) {
  //       this.sliderExploration.setValueW(valueW);
  //     } else {
  //       this.sliderPractice.setValueW(valueW);
  //     }

  //   } else if (slider === 'sliderC') {
  //     this.renderers2D.forEach(renderer => renderer.stackHelper.slice._stack._windowCenter = valueC);

  //     if (this.studyStarted) {
  //       this.sliderExploration.setValueC(valueC);
  //     } else {
  //       this.sliderPractice.setValueC(valueC);
  //     }

  //   } else if (slider === 'both') {
  //     this.settings.automaticSettingW = true;
  //     this.settings.automaticSettingC = true;

  //     if (this.studyStarted) {
  //       this.sliderExploration.setValueW(valueW);
  //       this.sliderExploration.setValueC(valueC);
  //     } else {
  //       this.sliderPractice.setValueW(valueW);
  //       this.sliderPractice.setValueC(valueC);
  //     }
  //   }

  //   this.renderers2D.forEach(renderer => renderer.stackHelper.index = renderer.stackHelper.index);

  //   this.onAxialChanged();
  // }

  setPerspectiveCameraZoom(args: IOrientation, transitionTime: number) {
    this._comparisonRenderer3D2.setCameraOrientation(args, transitionTime);
  }

  setPerspectiveCameraOrientation(args: IOrientation, transitionTime: number) {
    this._comparisonRenderer3D2.setCameraOrientation(args, transitionTime);
  }

  setSliceZoom(sliceZoom: number, sliceOrientation: string, transitionTime: number) {
    this._comparisonRenderer2D2.setSliceZoom(sliceZoom, transitionTime);
  }

  setSliceDrag(slicePosition: ISlicePosition, sliceOrientation: string, transitionTime: number) {
    this._comparisonRenderer2D2.setSlicePosition(slicePosition, transitionTime);
  }

  setSliceIndex(newIndex: number, transitionTime: number, sliceOrientation?: VIEWS) {
    if (this.settings.syncScroll) {
      if (sliceOrientation === 'axial') {
        this.settings.canvas._axialRenderer.changeSliceIndex(newIndex, transitionTime);
      }
    } 
    this._comparisonRenderer2D2.changeSliceIndex(newIndex, transitionTime);
  }

  navigateVolume(sliceOrientation: VIEWS, newIndex: number, transitionTime: number) {
    this._comparisonRenderer2D2.changeSliceIndex(newIndex, transitionTime, this._comparisonRenderer2D2.stackHelper.index);
    this.navigationVolumeCreated.emit({ sliceOrientation, newIndex });
    this.navigationStartIndex = newIndex;
  }


  renderAllArtifacts(sliceOrientation: VIEWS) {
    let index = 0;
    for (let i = 0; i < this._comparisonRenderer2D2.stackHelper._orientationMaxIndex - 1; i++) {
      index = index + 1;
      this._comparisonRenderer2D2.renderFromSliceChange(index);
    }
  }

  // setSliceIndex(sliceOrientation: VIEWS, newIndex: number) {
  //   const renderer = this.getRenderer(sliceOrientation);
  //   renderer.stackHelper.index = newIndex;
  // }

  changeSliceRemove(sliceOrientation: VIEWS, oldIndex: number) {
    this._comparisonRenderer2D2.removeFromSliceChange(oldIndex);
  }

  changeSliceRender(sliceOrientation: VIEWS, newIndex: number) {
    this._comparisonRenderer2D2.renderFromSliceChange(newIndex);
  }



  renderMeasurements(artifacts) {
    artifacts.forEach(artifact => this.renderArtifact(artifact.sliceOrientation, artifact));
    this.renderers2D.forEach(renderer => artifacts.forEach(artifact => renderer.renderFromSliceChange(artifact.sliceIndex)));
  }

  removeMeasurements(artifacts) {
    this.renderers2D.forEach(renderer => artifacts.forEach(artifact => renderer.removeFromSliceChange(artifact.sliceIndex)));
  }

  removeArtifact(sliceOrientation: VIEWS, artifact: Artifact) {
    this._comparisonRenderer2D2.removeArtifact(artifact);
  }

  renderArtifact(sliceOrientation: VIEWS, artifact: Artifact) {
    this._comparisonRenderer2D2.addArtifact(artifact);
  }

  deleteArtifact(sliceOrientation: VIEWS, artifact: Artifact) {
    this._comparisonRenderer2D2.deleteArtifact(artifact);
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

