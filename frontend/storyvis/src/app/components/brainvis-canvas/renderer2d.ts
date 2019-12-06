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

export class Renderer2D extends AMIRenderer implements IAMIRenderer {
  private _measurementMode: boolean;
  private _angleMode: boolean;
  private _freehandMode: boolean;
  private _voxelprobeMode: boolean;
  private _annotationMode: boolean;

  private _ruler: Ruler | null;
  private _rulers: Ruler[] = [];
  private _oldRulers: Ruler[] = [];
  private _newRulers: Ruler[] = [];
  public _pairs: THREE.Vector3[] = [];

  private _angle: Angle | null;
  private _angles: Angle[] = [];
  private _oldAngles: Angle[] = [];
  private _newAngles: Angle[] = [];

  private _freehand: Freehand;
  private _freehands: Freehand[] = [];
  private _newFreehands: Freehand[] = [];
  private _oldFreehands: Freehand[] = [];

  private _voxelprobe: Voxelprobe;
  private _voxelprobes: Voxelprobe[] = [];
  private _newVoxelprobes: Voxelprobe[] = [];
  private _oldVoxelprobes: Voxelprobe[] = [];

  private _annotation: Annotation;
  private _annotations: Annotation[] = [];
  private _newAnnotations: Annotation[] = [];
  private _oldAnnotations: Annotation[] = [];

  private _rulerID: number = -1;
  private _angleID: number = -1;
  private _freehandID: number = -1;
  private _voxelprobeID: number = -1;
  private _annotationID: number = -1;

  public _artifactID: number = -1;
  public _artifacts: Artifact[] = []; 
  public _view: View;

  constructor(view: View, canvas: BrainvisCanvasComponent) {
    super(view, canvas);
    // this._domElement = <HTMLElement>document.getElementById(view.domId);
    this._color = view.color; // 0x121212
    this._sliceOrientation = view.sliceOrientation; // 'axial'
    this._sliceColor = view.sliceColor; // 0xff1744
    this._targetID = view.targetID; // 1
    this._view = view;
    // this._artifacts = view.artifacts; //null
  }

  @Output() rulerCreated = new EventEmitter<Ruler>();
  @Output() rulerChanged = new EventEmitter<{ oldPoints: IPointPair, newPoints: IPointPair }>();
  @Output() rulerRemoved = new EventEmitter<Ruler>();

  @Output() angleCreated = new EventEmitter<Angle>();
  @Output() angleChanged = new EventEmitter<{ oldPoints: IPointAngle, newPoints: IPointAngle }>();
  @Output() angleRemoved = new EventEmitter<Angle>();

  @Output() freehandCreated = new EventEmitter<Freehand>();
  @Output() freehandChanged = new EventEmitter<{ oldPoints: IPointPair, newPoints: IPointPair }>();
  @Output() freehandRemoved = new EventEmitter<Freehand>();

  @Output() voxelprobeCreated = new EventEmitter<Voxelprobe>();
  @Output() voxelprobeChanged = new EventEmitter<{ oldPoints: IPointPair, newPoints: IPointPair }>();
  @Output() voxelprobeRemoved = new EventEmitter<Voxelprobe>();

  @Output() annotationCreated = new EventEmitter<Annotation>();
  @Output() annotationChanged = new EventEmitter<{ oldPoints: IPointPair, newPoints: IPointPair }>();
  @Output() annotationRemoved = new EventEmitter<Annotation>();

  init() {
    // this.rulerChanged.subscribe(console.log);
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
      this._domElement.clientHeight
    );
    this._renderer.setClearColor(0x121212, 1);
    this._renderer.domElement.id = this._targetID.toString();  //0,1,2,3 view ID
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

    this._ruler = null;
    this._measurementMode = false;

    this._angle = null;
    this._angleMode = false;

    this._freehand = null;
    this._freehandMode = false;

    this._voxelprobe = null;
    this._voxelprobeMode = false;

    this._annotation = null;
    this._annotationMode = false;

    this._initialized = true;

    // this._measurements.find(element => element.measurementID.sliceIndex == this._stackHelper.index)
    // .elements.forEach(element => element.style.display = 'block');
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
    this._renderer.setSize(
      this._domElement.clientWidth,
      this._domElement.clientHeight
    );

    // update info to draw borders properly
    this._stackHelper.slice.canvasWidth = this._domElement.clientWidth;
    this._stackHelper.slice.canvasHeight = this._domElement.clientHeight;
    this._localizerHelper.canvasWidth = this._domElement.clientWidth;
    this._localizerHelper.canvasHeight = this._domElement.clientHeight;
  }

  onScroll(event) {
    // if (!this._measurementMode) {
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

    this._canvas.dispatchEvent({
      type: 'sliceIndexChangeStart',
      changes: {
        sliceOrientation: this._sliceOrientation,
        newIndex: newIndex,
        oldIndex: oldIndex
      }
    });

    this._canvas.dispatchEvent({
      type: 'sliceIndexChanged',
      changes: {
        sliceOrientation: this._sliceOrientation,
        newIndex: newIndex,
        oldIndex: oldIndex
      }
    });

    // Ruler behaviour when scrolling is performed
    if (this._ruler) {
      if (this._rulers.find(element => element.index == newIndex)) {
        this._oldRulers = this._rulers.filter(x => x.index == oldIndex);
        this._oldRulers.forEach(element => element.widget.hideDOM());
        this._newRulers = this._rulers.filter(x => x.index == newIndex);
        this._newRulers.forEach(element => element.widget.showDOM());
      } else {
        this._oldRulers = this._rulers.filter(x => x.index == oldIndex);
        this._oldRulers.forEach(element => element.widget.hideDOM());
      }
    }

    // Angle behaviour when scrolling is performed
    if (this._angle) {
      if (this._angles.find(element => element.index == newIndex)) {
        this._oldAngles = this._angles.filter(x => x.index == oldIndex);
        this._oldAngles.forEach(element => element.widget.hideDOM());
        this._newAngles = this._angles.filter(x => x.index == newIndex);
        this._newAngles.forEach(element => element.widget.showDOM());
      } else {
        this._oldAngles = this._angles.filter(x => x.index == oldIndex);
        this._oldAngles.forEach(element => element.widget.hideDOM());
      }
    }

    // Freehand behaviour when scrolling is performed
    if (this._freehand) {
      if (this._freehands.find(element => element.index == newIndex)) {
        this._oldFreehands = this._freehands.filter(x => x.index == oldIndex);
        this._oldFreehands.forEach(element => element.widget.hideDOM());
        this._newFreehands = this._freehands.filter(x => x.index == newIndex);
        this._newFreehands.forEach(element => element.widget.showDOM());
      } else {
        this._oldFreehands = this._freehands.filter(x => x.index == oldIndex);
        this._oldFreehands.forEach(element => element.widget.hideDOM());
      }
    }

    // Voxelprobe behaviour when scrolling is performed
    if (this._voxelprobe) {
      if (this._voxelprobes.find(element => element.index == newIndex)) {
        this._oldVoxelprobes = this._voxelprobes.filter(x => x.index == oldIndex);
        this._oldVoxelprobes.forEach(element => element.widget.hideDOM());
        this._newVoxelprobes = this._voxelprobes.filter(x => x.index == newIndex);
        this._newVoxelprobes.forEach(element => element.widget.showDOM());
      } else {
        this._oldVoxelprobes = this._voxelprobes.filter(x => x.index == oldIndex);
        this._oldVoxelprobes.forEach(element => element.widget.hideDOM());
      }
    }

    // Annotation behaviour when scrolling is performed
    if (this._annotation) {
      if (this._annotations.find(element => element.index == newIndex)) {
        this._oldAnnotations = this._annotations.filter(x => x.index == oldIndex);
        this._oldAnnotations.forEach(element => element.widget.hideDOM());
        this._newAnnotations = this._annotations.filter(x => x.index == newIndex);
        this._newAnnotations.forEach(element => element.widget.showDOM());
      } else {
        this._oldAnnotations = this._annotations.filter(x => x.index == oldIndex);
        this._oldAnnotations.forEach(element => element.widget.hideDOM());
      }
    }
    // }
  }


  // Ruler

  startRuler = (evt) => {
    this._ruler = new Ruler(this, evt);
    this._rulers.push(this._ruler);
    this._pairs.push(this._ruler.pair);

    this._domElement.removeEventListener('mousedown', this.startRuler);

    // forward events
    // this._ruler.created.subscribe(arg => this.rulerCreated.emit(arg));
    // this._ruler.changed.subscribe(arg => this.rulerChanged.emit(arg));

    // create artifact
    this._artifactID = this._artifactID + 1;
    this._rulerID = this._rulerID + 1;
    this._ruler.artifact = {
      id: this._artifactID,
      type: 'ruler',
      typeID: this._rulerID,
      sliceIndex: this._ruler.index,
      view: this._domID,
      elements: [this._ruler.widget._line, this._ruler.widget._label
        // ,this._ruler.widget.children[0]._dom, this._ruler.widget.children[1]._dom
      ]
    }
    this._artifacts.push(this._ruler.artifact);

    this.addRuler(this._ruler);

 }


  addRuler = ( ruler: Ruler ) => {
    ruler.widget.append();
    console.log((window as any).prov.graph);
    this.rulerCreated.emit(ruler); 

    //need to add rendering update based on the artifacts

    // (window as any).prov.graph.artifacts.push(artifact);
  }

  removeRuler = ( ruler: Ruler ) => {
    ruler.widget.remove();
    (window as any).prov.graph.artifacts.splice(-1,1);
    this.rulerRemoved.emit(ruler); 

    //need to add rendering update based on the artifacts


    // for(let i = 0, length = this._ruler.artifact.elements.length; i<length; i++){
    //   document.getElementById("r0").appendChild(this._ruler.artifact.elements[i])
    // } 
  //  this.rulerRemoved.emit(elements);
  }

  createRuler = ({ p0, p1 }: IPointPair) => {
    this._ruler = new Ruler(this);

    // set position
    this._ruler.widget._handles[0].worldPosition = p0;
    this._ruler.widget._handles[1].worldPosition = p1;

    // make sure we're not in dragging mode
    this._ruler.widget._handles[1]._active = false;


    // forward events
    // this._ruler.changed.subscribe(arg => this.rulerChanged.emit(arg));
  }

  // updateRuler = ({ p0, p1 }: IPointPair) => {
  //   if (this._ruler) {
  //     // set position
  //     this._ruler.widget._handles[0].worldPosition = p0;
  //     this._ruler.widget._handles[1].worldPosition = p1;
  //     this._ruler.widget.update();
  //   }
  // }

  deleteRuler = () => {
    if (this._ruler) {
      // get position (needed for the undo provenance action).
      const p0 = this._ruler.widget._handles[0].worldPosition;
      const p1 = this._ruler.widget._handles[1].worldPosition;

      this._ruler.remove();
      this._ruler = null;
      // this.rulerRemoved.emit({ p0, p1 });
      this.measurementMode = false;
    }
  }


  // Angle

  startAngle = (evt) => {
    this._angle = new Angle(this, evt);
    this._angles.push(this._angle);
    // this._pairs.push(this._ruler.pair);

    this._domElement.removeEventListener('mousedown', this.startAngle);

    // forward events
    this._angle.created.subscribe(arg => this.angleCreated.emit(arg));
    // this._ruler.changed.subscribe(arg => this.rulerChanged.emit(arg));

    // to store the elements
    this._artifactID = this._artifactID + 1;

    let measurementID = {
      groupID: this._artifactID,
      sliceIndex: this._stackHelper.index,
      type: 'angle'
    };

    let elements = [this._angle.widget._line, this._angle.widget._line2, this._angle.widget._label];
    // this._measurements.push({ measurementID, elements });
  }

  addAngle = ( angle: Angle ) => {
    angle.widget.append();
    console.log((window as any).prov.graph);
    this.angleCreated.emit(angle); 

    //need to add rendering update based on the artifacts

    // (window as any).prov.graph.artifacts.push(artifact);
  }

  removeAngle = ( angle: Angle ) => {
    angle.widget.remove();
    (window as any).prov.graph.artifacts.splice(-1,1);
    this.angleRemoved.emit(angle); 

    //need to add rendering update based on the artifacts


    // for(let i = 0, length = this._ruler.artifact.elements.length; i<length; i++){
    //   document.getElementById("r0").appendChild(this._ruler.artifact.elements[i])
    // } 
  //  this.rulerRemoved.emit(elements);
  }

  createAngle = ({ p0, p1, p2 }: IPointAngle) => {
    this._angle = new Angle(this);

    // set position
    this._angle.widget._handles[0].worldPosition = p0;
    this._angle.widget._handles[1].worldPosition = p1;
    this._angle.widget._handles[2].worldPosition = p2;

    // make sure we're not in dragging mode
    this._angle.widget._handles[2]._active = false;

    // forward events
    // this._ruler.changed.subscribe(arg => this.rulerChanged.emit(arg));
  }

  // updateAngle = ({ p0, p1 }: IPointPair) => {
  //   if (this._angle) {
  //     // set position
  //     this._angle.widget._handles[0].worldPosition = p0;
  //     this._angle.widget._handles[1].worldPosition = p1;
  //     this._angle.widget.update();
  //   }
  // }

  deleteAngle = () => {
    if (this._angle) {
      // get position (needed for the undo provenance action).
      const p0 = this._angle.widget._handles[0].worldPosition;
      const p1 = this._angle.widget._handles[1].worldPosition;
      const p2 = this._angle.widget._handles[2].worldPosition;

      this._angle.remove();
      this._angle = null;
      // this.angleRemoved.emit({ p0, p1, p2 });
      this.angleMode = false;
    }
  }


  // Freehand

  startFreehand = (evt) => {
    this._freehand = new Freehand(this, evt);
    this._freehands.push(this._freehand);
    // this._pairs.push(this._ruler.pair);

    this._domElement.removeEventListener('mousedown', this.startFreehand);

    // forward events
    this._freehand.created.subscribe(arg => this.freehandCreated.emit(arg));
    // this._ruler.changed.subscribe(arg => this.rulerChanged.emit(arg));

    // to store the elements
    this._artifactID = this._artifactID + 1;

    let measurementID = {
      groupID: this._artifactID,
      sliceIndex: this._stackHelper.index,
      type: 'freehand'
    };

    let elements = [this._freehand.widget._lines, this._freehand.widget._label];
    // this._measurements.push({ measurementID, elements });
  }

  addFreehand = ( freehand: Freehand ) => {
    freehand.widget.append();
    console.log((window as any).prov.graph);
    this.freehandCreated.emit(freehand); 

    //need to add rendering update based on the artifacts

    // (window as any).prov.graph.artifacts.push(artifact);
  }

  removeFreehand = ( freehand: Freehand ) => {
    freehand.widget.remove();
    (window as any).prov.graph.artifacts.splice(-1,1);
    this.freehandRemoved.emit(freehand); 

    //need to add rendering update based on the artifacts


    // for(let i = 0, length = this._ruler.artifact.elements.length; i<length; i++){
    //   document.getElementById("r0").appendChild(this._ruler.artifact.elements[i])
    // } 
  //  this.rulerRemoved.emit(elements);
  }

  createFreehand = ({ p0, p1 }: IPointPair) => {
    this._freehand = new Freehand(this);

    // set position
    this._freehand.widget._handles[0].worldPosition = p0;
    this._freehand.widget._handles[1].worldPosition = p1;

    // make sure we're not in dragging mode
    this._freehand.widget._handles[1]._active = false;

    // forward events
    // this._ruler.changed.subscribe(arg => this.rulerChanged.emit(arg));
  }

  // updateFreehand = ({ p0, p1 }: IPointPair) => {
  //   if (this._freehand) {
  //     // set position
  //     this._freehand.widget._handles[0].worldPosition = p0;
  //     this._freehand.widget._handles[1].worldPosition = p1;
  //     this._freehand.widget.update();
  //   }
  // }

  deleteFreehand = () => {
    if (this._freehand) {
      // get position (needed for the undo provenance action).
      const p0 = this._freehand.widget._handles[0].worldPosition;
      const p1 = this._freehand.widget._handles[1].worldPosition;

      this._freehand.remove();
      this._freehand = null;
      // this.freehandRemoved.emit({ p0, p1 });
      this.freehandMode = false;
    }
  }


  // VoxelProbe

  startVoxelprobe = (evt) => {
    this._voxelprobe = new Voxelprobe(this, evt);
    this._voxelprobes.push(this._voxelprobe);
    // this._pairs.push(this._ruler.pair);

    this._domElement.removeEventListener('mousedown', this.startVoxelprobe);

    // forward events
    this._voxelprobe.created.subscribe(arg => this.voxelprobeCreated.emit(arg));
    // this._ruler.changed.subscribe(arg => this.rulerChanged.emit(arg));

    // to store the elements
    this._artifactID = this._artifactID + 1;

    let measurementID = {
      groupID: this._artifactID,
      sliceIndex: this._stackHelper.index,
      type: 'voxelprobe'
    };

    let elements = [this._voxelprobe.widget._label];
    // this._measurements.push({ measurementID, elements });
  }

  addVoxelprobe = ( voxelprobe: Voxelprobe ) => {
    voxelprobe.widget.append();
    console.log((window as any).prov.graph);
    this.voxelprobeCreated.emit(voxelprobe); 

    //need to add rendering update based on the artifacts

    // (window as any).prov.graph.artifacts.push(artifact);
  }

  removeVoxelprobe = ( voxelprobe: Voxelprobe ) => {
    voxelprobe.widget.remove();
    (window as any).prov.graph.artifacts.splice(-1,1);
    this.voxelprobeRemoved.emit(voxelprobe); 

    //need to add rendering update based on the artifacts


    // for(let i = 0, length = this._ruler.artifact.elements.length; i<length; i++){
    //   document.getElementById("r0").appendChild(this._ruler.artifact.elements[i])
    // } 
  //  this.rulerRemoved.emit(elements);
  }

  createVoxelprobe = ({ p0, p1 }: IPointPair) => {
    this._voxelprobe = new Voxelprobe(this);

    // set position
    this._voxelprobe.widget._handles[0].worldPosition = p0;
    this._voxelprobe.widget._handles[1].worldPosition = p1;

    // make sure we're not in dragging mode
    this._voxelprobe.widget._handles[1]._active = false;


    // forward events
    // this._ruler.changed.subscribe(arg => this.rulerChanged.emit(arg));
  }

  // updateVoxelprobe = ({ p0, p1 }: IPointPair) => {
  //   if (this._voxelprobe) {
  //     // set position
  //     this._voxelprobe.widget._handles[0].worldPosition = p0;
  //     this._voxelprobe.widget._handles[1].worldPosition = p1;
  //     this._voxelprobe.widget.update();
  //   }
  // }

  deleteVoxelprobe = () => {
    if (this._voxelprobe) {
      // get position (needed for the undo provenance action).
      const p0 = this._voxelprobe.widget._handles[0].worldPosition;
      const p1 = this._voxelprobe.widget._handles[1].worldPosition;

      this._voxelprobe.remove();
      this._voxelprobe = null;
      // this.voxelprobeRemoved.emit({ p0, p1 });
      this.voxelprobeMode = false;
    }
  }


  // Annotation

  startAnnotation = (evt) => {
    this._annotation = new Annotation(this, evt);
    this._annotations.push(this._annotation);
    // this._pairs.push(this._ruler.pair);

    this._domElement.removeEventListener('mousedown', this.startAnnotation);

    // forward events
    this._annotation.created.subscribe(arg => this.annotationCreated.emit(arg));
    // this._ruler.changed.subscribe(arg => this.rulerChanged.emit(arg));
  }

  addAnnotation = ( annotation: Annotation ) => {
    annotation.widget.append();
    console.log((window as any).prov.graph);
    this.annotationCreated.emit(annotation); 

    //need to add rendering update based on the artifacts

    // (window as any).prov.graph.artifacts.push(artifact);
  }

  removeAnnotation = ( annotation: Annotation ) => {
    annotation.widget.remove();
    (window as any).prov.graph.artifacts.splice(-1,1);
    this.annotationRemoved.emit(annotation); 

    //need to add rendering update based on the artifacts


    // for(let i = 0, length = this._ruler.artifact.elements.length; i<length; i++){
    //   document.getElementById("r0").appendChild(this._ruler.artifact.elements[i])
    // } 
  //  this.rulerRemoved.emit(elements);
  }

  createAnnotation = ({ p0, p1 }: IPointPair) => {
    this._annotation = new Annotation(this);

    // set position
    this._annotation.widget._handles[0].worldPosition = p0;
    this._annotation.widget._handles[1].worldPosition = p1;

    // make sure we're not in dragging mode
    this._annotation.widget._handles[1]._active = false;

    // forward events
    // this._ruler.changed.subscribe(arg => this.rulerChanged.emit(arg));

    // to store the elements
    this._artifactID = this._artifactID + 1;

    let measurementID = {
      groupID: this._artifactID,
      sliceIndex: this._stackHelper.index,
      type: 'annotation'
    };

    let elements = [this._annotation.widget._labeltext, this._annotation.widget._dashline, this._annotation.widget._line, this._annotation.widget._label];
    // this._measurements.push({ measurementID, elements });
  }

  // updateAnnotation = ({ p0, p1 }: IPointPair) => {
  //   if (this._annotation) {
  //     // set position
  //     this._annotation.widget._handles[0].worldPosition = p0;
  //     this._annotation.widget._handles[1].worldPosition = p1;
  //     this._annotation.widget.update();
  //   }
  // }

  deleteAnnotation = () => {
    if (this._annotation) {
      // get position (needed for the undo provenance action).
      const p0 = this._annotation.widget._handles[0].worldPosition;
      const p1 = this._annotation.widget._handles[1].worldPosition;

      this._annotation.remove();
      this._annotation = null;
      // this.annotationRemoved.emit({ p0, p1 });
      this.annotationMode = false;
    }
  }

  get sliceOrientation() { return this._sliceOrientation; }

  // get updateArtifact() { return this.graph; }


  set measurementMode(isEnabled: boolean) {
    this._measurementMode = isEnabled;
    if (isEnabled) {
      // create a ruler on first click
      this.domElement.addEventListener('mousedown', this.startRuler);
      this.domElement.addEventListener('shiftKey', this.deleteRuler);
    } else {
      this.domElement.removeEventListener('mousedown', this.startRuler);
      this.domElement.removeEventListener('shiftKey', this.deleteRuler);
    }
  }

  set angleMode(isEnabled: boolean) {
    this._angleMode = isEnabled;
    if (isEnabled) {
      // create a ruler on first click
      this.domElement.addEventListener('mousedown', this.startAngle);
      this.domElement.addEventListener('shiftKey', this.deleteAngle);
    } else {
      this.domElement.removeEventListener('mousedown', this.startAngle);
      this.domElement.removeEventListener('shiftKey', this.deleteAngle);
    }
  }

  set freehandMode(isEnabled: boolean) {
    this._freehandMode = isEnabled;
    if (isEnabled) {
      // create a ruler on first click
      this.domElement.addEventListener('mousedown', this.startFreehand);
      this.domElement.addEventListener('shiftKey', this.deleteFreehand);
    } else {
      this.domElement.removeEventListener('mousedown', this.startFreehand);
      this.domElement.removeEventListener('shiftKey', this.deleteFreehand);
    }
  }

  set voxelprobeMode(isEnabled: boolean) {
    this._voxelprobeMode = isEnabled;
    if (isEnabled) {
      // create a ruler on first click
      this.domElement.addEventListener('mousedown', this.startVoxelprobe);
      this.domElement.addEventListener('shiftKey', this.deleteVoxelprobe);
    } else {
      this.domElement.removeEventListener('mousedown', this.startVoxelprobe);
      this.domElement.removeEventListener('shiftKey', this.deleteVoxelprobe);
    }
  }

  set annotationMode(isEnabled: boolean) {
    this._annotationMode = isEnabled;
    if (isEnabled) {
      // create a ruler on first click
      this.domElement.addEventListener('mousedown', this.startAnnotation);
      this.domElement.addEventListener('shiftKey', this.deleteAnnotation);
    } else {
      this.domElement.removeEventListener('mousedown', this.startAnnotation);
      this.domElement.removeEventListener('shiftKey', this.deleteAnnotation);
    }
  }
}
