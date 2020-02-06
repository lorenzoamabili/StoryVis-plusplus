import * as THREE from 'three';
import * as AMI from 'ami.js';
import { IAMIRenderer, IPointPair, IPointAngle, View } from './utils/types';
import { AMIRenderer } from './amiRenderer';
import { BrainvisCanvasComponent } from './brainvis-canvas.component';
import { EventEmitter, Output } from '@angular/core';
import { UninitializedError } from './utils/exceptions';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import Ruler from './ruler';
import Angle from './angle';
import Freehand from './freehand';
import Voxelprobe from './voxelprobe';
import Annotation from './annotation';
import { Artifact } from '@visualstorytelling/provenance-core/src/api';
import { ProvenanceTracker } from '@visualstorytelling/provenance-core';

export class Renderer2D extends AMIRenderer implements IAMIRenderer {
  private _rulerMode: boolean;
  private _angleMode: boolean;
  private _freehandMode: boolean;
  private _voxelprobeMode: boolean;
  private _annotationMode: boolean;

  private _measurement: Ruler | Angle | Freehand | Voxelprobe | Annotation | null;
  public _measurements: Artifact[] = [];  // measurements/artifacts created in the current branch
  public _oldMeasurements: Artifact[] = [];
  public _newMeasurements: Artifact[] = [];
  public _currentArtifacts: Artifact[] = [];

  public _pairs: THREE.Vector3[] = [];

  private _artifactInit: boolean = true;

  public tracker: ProvenanceTracker;

  // private _angleInit: boolean = false;
  // private _freehandInit: boolean = false;
  // private _voxelprobeInit: boolean = false;
  // private _annotationInit: boolean = false;

  private _rulerID: number = -1;
  private _angleID: number = -1;
  private _freehandID: number = -1;
  private _voxelprobeID: number = -1;
  private _annotationID: number = -1;
  public _artifactID: number = -1;

  public _view: View;


  constructor(view: View, canvas: BrainvisCanvasComponent) {
    super(view, canvas);
    // this._domElement = <HTMLElement>document.getElementById(view.domId);
    this._color = view.color; // 0x121212
    this._sliceOrientation = view.sliceOrientation; // 'axial'
    this._sliceColor = view.sliceColor; // 0xff1744
    this._targetID = view.targetID; // 1
    this._view = view;
  }

  @Output() artifactCreated = new EventEmitter<Artifact>();
  // @Output() artifactChanged = new EventEmitter<{ oldPoints: IPointPair, newPoints: IPointPair }>();
  @Output() artifactRemoved = new EventEmitter<Artifact>();

  init() {
    if (this._initialized) {
      return;
    }

    // renderer
    this._renderer = new THREE.WebGLRenderer({
      antialias: true,
      preserveDrawingBuffer: true
    });
    this._renderer.autoClear = false;
    this._renderer.localClippingEnabled = true;
    this._renderer.setSize(
      this._domElement.clientWidth,
      this._domElement.clientHeight,
      false
    );
    this._renderer.domElement.setAttribute('style', 'width:100%; height:100%');
    this._renderer.setClearColor(0x121212, 1);
    this._renderer.domElement.id = this._targetID.toString();  // 0,1,2,3 view ID
    this._domElement.appendChild(this._renderer.domElement); // append canvas to main DOMelement

    // camera
    this._camera = new AMI.OrthographicCamera(
      this._domElement.clientWidth / -2,
      this._domElement.clientWidth / 2,
      this._domElement.clientHeight / 2,
      this._domElement.clientHeight / -2);
    // 1,1000);

    // controls
    this._controls = new AMI.TrackballOrthoControl(
      this._camera,
      this._domElement
    );
    this._controls.staticMoving = true;
    this._controls.noRotate = true;
    this._camera.controls = this._controls;

    // scene
    this._scene = new THREE.Scene();


    this._renderer.domElement.addEventListener('click', this.onClick.bind(this));

    // this.scene.add()

    this._measurement = null;
    this._rulerMode = false;
    this._angleMode = false;
    this._freehandMode = false;
    this._voxelprobeMode = false;
    this._annotationMode = false;

    this._initialized = true;

  }

  initHelpersStack(stack) {
    if (!this._initialized) {
      throw new UninitializedError();
    }

    this._stackHelper = new AMI.StackHelper(stack);
    this._stackHelper.bbox.visible = false;
    this._stackHelper.borderColor = this._sliceColor;
    // this._stackHelper.slice._windowWidth = 1000;
    // console.log(this._stackHelper.slice);
    // console.log(this._stackHelper.slice._windowWidth);
    // this._stackHelper.slice._windowCenter = 1000;
    this._stackHelper.slice.canvasWidth = this._domElement.clientWidth;
    this._stackHelper.slice.canvasHeight = this._domElement.clientHeight;

    // set camera
    const worldbb = stack.worldBoundingBox();
    const lpsDims = new THREE.Vector3(
      (worldbb[1] - worldbb[0]) / 2,
      (worldbb[3] - worldbb[2]) / 2,
      (worldbb[5] - worldbb[4]) / 2
    );

    // box: {halfDimensions, center}
    const box = {
      center: stack.worldCenter().clone(),
      halfDimensions: new THREE.Vector3(
        lpsDims.x + 10,
        lpsDims.y + 10,
        lpsDims.z + 10
      )
    };

    // init and zoom
    const canvas = {
      width: this._domElement.clientWidth,
      height: this._domElement.clientHeight
    };

    this._camera.directions = [stack.xCosine, stack.yCosine, stack.zCosine];
    this._camera.box = box;
    this._camera.canvas = canvas;
    this._camera.orientation = this._sliceOrientation;
    this._camera.update();
    this._camera.fitBox(2, 1);

    this._stackHelper.orientation = this._camera.stackOrientation;
    this._stackHelper.index = Math.floor(
      this._stackHelper.orientationMaxIndex / 2
    );
    this._scene.add(this._stackHelper);
  }

  initHelpersLocalizer(stack, referencePlane, localizers) {
    if (!this._initialized) {
      throw new UninitializedError();
    }

    this._localizerHelper = new AMI.LocalizerHelper(
      stack,
      this._stackHelper.slice.geometry,
      referencePlane
    );

    for (let i = 0; i < localizers.length; i++) {
      this._localizerHelper['plane' + (i + 1)] = localizers[i].plane;
      this._localizerHelper['color' + (i + 1)] = localizers[i].color;
    }

    this._localizerHelper.canvasWidth = this._domElement.clientWidth;
    this._localizerHelper.canvasHeight = this._domElement.clientHeight;

    this._localizerScene = new THREE.Scene();
    this._localizerScene.add(this._localizerHelper);
  }

  updateLocalizer(targetLocalizersHelpers) {
    const refHelper = this._stackHelper;
    const plane = refHelper.slice.cartesianEquation();
    this._localizerHelper.referencePlane = plane;

    // bit of a hack... works fine for this application
    for (let i = 0; i < targetLocalizersHelpers.length; i++) {
      for (let j = 0; j < 3; j++) {
        const targetPlane = targetLocalizersHelpers[i]['plane' + (j + 1)];
        if (
          targetPlane &&
          plane.x.toFixed(6) === targetPlane.x.toFixed(6) &&
          plane.y.toFixed(6) === targetPlane.y.toFixed(6) &&
          plane.z.toFixed(6) === targetPlane.z.toFixed(6)
        ) {
          targetLocalizersHelpers[i]['plane' + (j + 1)] = plane;
        }
      }
    }

    // update the geometry will create a new mesh
    this._localizerHelper.geometry = refHelper.slice.geometry;
  }

  updateClipPlane(clipPlane) {
    const vertices = this._stackHelper.slice.geometry.vertices;
    const p1 = new THREE.Vector3(vertices[0].x, vertices[0].y, vertices[0].z).applyMatrix4(
      this._stackHelper._stack.ijk2LPS
    );
    const p2 = new THREE.Vector3(vertices[1].x, vertices[1].y, vertices[1].z).applyMatrix4(
      this._stackHelper._stack.ijk2LPS
    );
    const p3 = new THREE.Vector3(vertices[2].x, vertices[2].y, vertices[2].z).applyMatrix4(
      this._stackHelper._stack.ijk2LPS
    );

    clipPlane.setFromCoplanarPoints(p1, p2, p3);

    const cameraDirection = new THREE.Vector3(1, 1, 1);
    cameraDirection.applyQuaternion(this._camera.quaternion);

    if (cameraDirection.dot(clipPlane.normal) > 0) {
      clipPlane.negate();
    }

    // resize event
    this._renderer.domElement.addEventListener('resize', this.onWindowResize, false);
  }

  render() {
    if (!this._initialized) {
      throw new UninitializedError();
    }

    this._controls.update();
    this._renderer.clear();
    this._renderer.render(this._scene, this._camera);

    // mesh
    this._renderer.clearDepth();
    // data.forEach(function(object, key) {
    //   object.materialFront.clippingPlanes = [clipPlane1];
    //   object.materialBack.clippingPlanes = [clipPlane1];
    //   r1.renderer.render(object.scene, r1.camera, redTextureTarget, true);
    //   r1.renderer.clearDepth();
    //   redContourHelper.contourWidth = object.selected ? 3 : 2;
    //   redContourHelper.contourOpacity = object.selected ? 1 : 0.8;
    //   r1.renderer.render(redContourScene, r1.camera);
    //   r1.renderer.clearDepth();
    // });

    // localizer
    this._renderer.clearDepth();
    this._renderer.render(this._localizerScene, this._camera);
  }

  onWindowResize() {
    this._camera.canvas = {
      width: this._domElement.clientWidth,
      height: this._domElement.clientHeight,
    };
    this._camera.fitBox(2, 1);
    const width = this._renderer.domElement.clientWidth;
    const height = this._renderer.domElement.clientHeight;
    this._renderer.setSize(
      width,
      height,
      false
    );

    // update info to draw borders properly
    this._stackHelper.slice.canvasWidth = this._domElement.clientWidth;
    this._stackHelper.slice.canvasHeight = this._domElement.clientHeight;
    this._localizerHelper.canvasWidth = this._domElement.clientWidth;
    this._localizerHelper.canvasHeight = this._domElement.clientHeight;
  }

  onScroll(event) {
    // if (this._rulerMode || this._angleMode || this._freehandMode || this._voxelprobeMode || this._annotationMode) {}
    // else {
    super.onScroll(event);

    const oldIndex = this._stackHelper.index;

    if (event.delta > 0) {
      if (this._stackHelper.index >= this._stackHelper.orientationMaxIndex - 1) {
        return;
      }
      this._stackHelper.index += 1;
    } else {
      if (this._stackHelper.index <= 0) {
        return;
      }
      this._stackHelper.index -= 1;
    }

    const newIndex = this._stackHelper.index;

    let oldArtifacts = this._currentArtifacts;
    this.updateArtifact(newIndex, oldIndex);
    let newArtifacts = this._currentArtifacts;

    console.log(newArtifacts);

    this._canvas.dispatchEvent({
      type: 'sliceIndexChangeStart',
      changes: {
        sliceOrientation: this._sliceOrientation,
        oldIndex: oldIndex,
        newIndex: newIndex
      },
      oldArtifacts: oldArtifacts
    });

    // console.log(this._currentArtifacts);


    // console.log(this._currentArtifacts);

    this._canvas.dispatchEvent({
      type: 'sliceIndexChanged',
      changes: {
        sliceOrientation: this._sliceOrientation,
        oldIndex: oldIndex,
        newIndex: newIndex
      },
      newArtifacts: newArtifacts
    });

    // this.oldArtifacts(oldArtifacts);
    // this.newArtifacts(newArtifacts);
    //}
  }


  updateArtifact(newIndex, oldIndex) {
    // Artifacts behaviour when scrolling is performed 
    if (this._measurements.length !== 0) {
      if (this._measurements.find(x => x.sliceIndex == newIndex)) {
        if (this._currentArtifacts.length !== 0) {
          this._oldMeasurements = this._measurements.filter(x => x.sliceIndex == oldIndex);
          this._oldMeasurements.forEach(x => this.removeArtifactElms(x));
        }
        this._newMeasurements = this._measurements.filter(x => x.sliceIndex == newIndex);
        this._newMeasurements.forEach(x => this.renderArtifactElms(x));
      } else {
        if (this._currentArtifacts.length !== 0) {
          this._oldMeasurements = this._measurements.filter(x => x.sliceIndex == oldIndex);
          this._oldMeasurements.forEach(x => this.removeArtifactElms(x));
        }
      }
    }
  }


  // oldArtifacts(oldArtifacts) {
  //   console.log(oldArtifacts);
  //   if ((oldArtifacts) && (oldArtifacts.length !== 0)) {
  //     for (let i = 0; i < oldArtifacts.length; i++) {
  //       this.renderArtifactElms(oldArtifacts[i]);
  //     }
  //   }
  // }

  // newArtifacts(newArtifacts) {
  //   console.log(newArtifacts);
  //   if ((newArtifacts) && (newArtifacts.length !== 0)) {
  //     for (let i = 0; i < newArtifacts.length; i++) {
  //       this.renderArtifactElms(newArtifacts[i]);
  //     }
  //   }
  // }



  // renderArtifacts(artifact) {
  //   for (let i = 0; i < artifact.elements.length; i++) {
  //     if (artifact.elements[i].length !== 1) {
  //       for (let l = 0; l < artifact.elements[i].length; l++) {
  //         this._domElement.appendChild(artifact.elements[i][l]);
  //       }
  //     }
  //     this._domElement.appendChild(artifact.elements[i]);
  //   }
  // }

  // removeArtifacts(artifact) {
  //   for (let i = 0; i < artifact.elements.length; i++) {
  //     if (artifact.elements[i].length !== 1) {
  //       for (let l = 0; l < artifact.elements[i].length; l++) {
  //         this._domElement.removeChild(artifact.elements[i][l]);
  //       }
  //     }
  //     this._domElement.removeChild(artifact.elements[i]);
  //   }
  // }

  renderArtifactElms(artifact: Artifact) {
    if (!this._artifactInit) {
      for (let i = 0; i < artifact.elements.length; i++) {
        this._domElement.appendChild(artifact.elements[i]);
      }
    } else {
      this._artifactInit = false;
    }
    this._currentArtifacts.push(artifact);
  }

  removeArtifactElms(artifact: Artifact) {
    for (let i = 0; i < artifact.elements.length; i++) {
      this._domElement.removeChild(artifact.elements[i]);
    }
    this._currentArtifacts.splice(-1, 1);
  }



  addArtifact = (artifact: Artifact) => {
    this.renderArtifactElms(artifact);
    this._measurements.push(this._measurement.artifact);
    console.log(this._measurements);
    this.artifactCreated.emit(artifact);
  }

  removeArtifact = (artifact: Artifact) => {
    this.removeArtifactElms(artifact);
    this._measurements.splice(-1, 1);
    console.log();
    this.artifactRemoved.emit(artifact);
  }


  // Ruler

  startRuler = (evt) => {
    this._measurement = new Ruler(this, evt);
    this._pairs.push(this._measurement.pair);

    this._domElement.removeEventListener('mousedown', this.startRuler);

    // forward events
    // this._ruler.created.subscribe(arg => this.rulerCreated.emit(arg));
    // this._ruler.changed.subscribe(arg => this.rulerChanged.emit(arg));

    // create artifact
    this._artifactID = this._artifactID + 1;
    this._rulerID = this._rulerID + 1;
    this._measurement.artifact = {
      id: this._artifactID,
      type: 'ruler',
      typeID: this._rulerID,
      sliceIndex: this._measurement.index,
      view: this._domID,
      elements: [this._measurement.widget._line, this._measurement.widget._label
        , this._measurement.widget.children[0]._dom, this._measurement.widget.children[1]._dom
      ]
    }
    this._artifactInit = true;
    this.addArtifact(this._measurement.artifact);

  }


  // Angle

  startAngle = (evt) => {
    this._measurement = new Angle(this, evt);
    // this._pairs.push(this._ruler.pair);

    this._domElement.removeEventListener('mousedown', this.startAngle);

    // create artifact
    this._artifactID = this._artifactID + 1;
    this._angleID = this._angleID + 1;
    this._measurement.artifact = {
      id: this._artifactID,
      type: 'angle',
      typeID: this._angleID,
      sliceIndex: this._measurement.index,
      view: this._domID,
      elements: [this._measurement.widget._line, this._measurement.widget._label, this._measurement.widget._line2
        , this._measurement.widget.children[0]._dom, this._measurement.widget.children[1]._dom, this._measurement.widget.children[2]._dom
      ]
    }
    this._artifactInit = true;
    this.addArtifact(this._measurement.artifact);
  }



  // Freehand

  startFreehand = (evt) => {
    this._measurement = new Freehand(this, evt);
    // this._pairs.push(this._ruler.pair);

    this._domElement.removeEventListener('mousedown', this.startFreehand);

    // create artifact
    this._artifactID = this._artifactID + 1;
    this._freehandID = this._freehandID + 1;
    const handles = this._measurement.widget.children.filter(x => x !== null);
    for (let i = 0, length = this._measurement.widget.children.length; i < length; i++) {
      handles.push(this._measurement.widget.children[i]._dom);
    }
    const elems = [this._measurement.widget._label, ...this._measurement.widget._lines, ...handles];

    this._measurement.artifact = {
      id: this._artifactID,
      type: 'freehand',
      typeID: this._freehandID,
      sliceIndex: this._measurement.index,
      view: this._domID,
      elements: elems
    }
    this._artifactInit = true;
    this.addArtifact(this._measurement.artifact);
  }


  // VoxelProbe

  startVoxelprobe = (evt) => {
    this._measurement = new Voxelprobe(this, evt);
    // this._pairs.push(this._ruler.pair);

    this._domElement.removeEventListener('mousedown', this.startVoxelprobe);

    // create artifact
    this._artifactID = this._artifactID + 1;
    this._voxelprobeID = this._voxelprobeID + 1;
    this._measurement.artifact = {
      id: this._artifactID,
      type: 'voxelprobe',
      typeID: this._voxelprobeID,
      sliceIndex: this._measurement.index,
      view: this._domID,
      elements: [this._measurement.widget._label, this._measurement.widget.children[0]._dom
      ]
    }
    this._artifactInit = true;
    this.addArtifact(this._measurement.artifact);
  }


  // Annotation

  startAnnotation = (evt) => {
    this._measurement = new Annotation(this, evt);
    // this._pairs.push(this._ruler.pair);

    this._domElement.removeEventListener('mousedown', this.startAnnotation);

    const handles = this._measurement.widget.children.filter(x => x !== null);
    for (let i = 0, length = handles.length; i < length; i++) {
      handles.push(this._measurement.widget.children[i]._dom);
    }
    const elems = [this._measurement.widget._line, this._measurement.widget._label, this._measurement.widget._dashline, ...handles];

    // create artifact
    this._artifactID = this._artifactID + 1;
    this._annotationID = this._annotationID + 1;
    this._measurement.artifact = {
      id: this._artifactID,
      type: 'annotation',
      typeID: this._annotationID,
      sliceIndex: this._measurement.index,
      view: this._domID,
      elements: elems.filter(x => x instanceof HTMLElement)
    }
    this._artifactInit = true;
    this.addArtifact(this._measurement.artifact);
  }


  get sliceOrientation() { return this._sliceOrientation; }

  // get updateArtifact() { return this.graph; }


  set rulerMode(isEnabled: boolean) {
    this._rulerMode = isEnabled;
    if (isEnabled) {
      // create a ruler on first click
      this.domElement.addEventListener('mousedown', this.startRuler);
      // this.domElement.addEventListener('shiftKey', this.deleteRuler);
    } else {
      this.domElement.removeEventListener('mousedown', this.startRuler);
      // this.domElement.removeEventListener('shiftKey', this.deleteRuler);
    }
  }

  set angleMode(isEnabled: boolean) {
    this._angleMode = isEnabled;
    if (isEnabled) {
      // create a ruler on first click
      this.domElement.addEventListener('mousedown', this.startAngle);
      // this.domElement.addEventListener('shiftKey', this.deleteAngle);
    } else {
      this.domElement.removeEventListener('mousedown', this.startAngle);
      // this.domElement.removeEventListener('shiftKey', this.deleteAngle);
    }
  }

  set freehandMode(isEnabled: boolean) {
    this._freehandMode = isEnabled;
    if (isEnabled) {
      // create a ruler on first click
      this.domElement.addEventListener('mousedown', this.startFreehand);
      // this.domElement.addEventListener('shiftKey', this.deleteFreehand);
    } else {
      this.domElement.removeEventListener('mousedown', this.startFreehand);
      // this.domElement.removeEventListener('shiftKey', this.deleteFreehand);
    }
  }

  set voxelprobeMode(isEnabled: boolean) {
    this._voxelprobeMode = isEnabled;
    if (isEnabled) {
      // create a ruler on first click
      this.domElement.addEventListener('mousedown', this.startVoxelprobe);
      // this.domElement.addEventListener('shiftKey', this.deleteVoxelprobe);
    } else {
      this.domElement.removeEventListener('mousedown', this.startVoxelprobe);
      // this.domElement.removeEventListener('shiftKey', this.deleteVoxelprobe);
    }
  }

  set annotationMode(isEnabled: boolean) {
    this._annotationMode = isEnabled;
    if (isEnabled) {
      // create a ruler on first click
      this.domElement.addEventListener('mousedown', this.startAnnotation);
      // this.domElement.addEventListener('shiftKey', this.deleteAnnotation);
    } else {
      this.domElement.removeEventListener('mousedown', this.startAnnotation);
      // this.domElement.removeEventListener('shiftKey', this.deleteAnnotation);
    }
  }
}
