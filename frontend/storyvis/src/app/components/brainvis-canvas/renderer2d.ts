import * as THREE from "three";
import * as AMI from "ami.js";
import { IAMIRenderer, IPointPair, IPointAngle, View } from "./utils/types";
import { AMIRenderer } from "./amiRenderer";
import { BrainvisCanvasComponent } from "./brainvis-canvas.component";
import { EventEmitter, Output } from "@angular/core";
import { UninitializedError } from "./utils/exceptions";
import { THIS_EXPR } from "@angular/compiler/src/output/output_ast";
import Ruler from "./ruler";
import Angle from "./angle";
import Freehand from "./freehand";
import Voxelprobe from "./voxelprobe";
import Annotation from "./annotation";
import { Artifact } from "@visualstorytelling/provenance-core/src/api";
import { ProvenanceTracker } from "@visualstorytelling/provenance-core";

export class Renderer2D extends AMIRenderer implements IAMIRenderer {
  private _rulerMode: boolean;
  private _angleMode: boolean;
  // private _freehandMode: boolean;
  private _voxelprobeMode: boolean;
  private _annotationMode: boolean;

  private _measurement: Ruler | Angle | Freehand | Voxelprobe | Annotation | null;

  public _artifactsOnMasterBranch: Artifact[] = []; // measurements/artifacts created in the current branch
  public _oldMeasurements: Artifact[] = [];
  public _newMeasurements: Artifact[] = [];

  private _artifactInit: boolean = false;
  public _artifactID: number = -1;

  public tracker: ProvenanceTracker;
  public _view: View;

  public annotationCounter: number = 0;

  public mouseDownEvent = new MouseEvent('mousedown', {
    clientX: 0,
    clientY: 0,
    bubbles: true,
    cancelable: true
  });

  public mouseMoveEvent = new MouseEvent('mousemove', {
    clientX: 0,
    clientY: 0,
    bubbles: true,
    cancelable: true
  });

  public mouseUpEvent = new MouseEvent('mouseup', {
    bubbles: true,
    cancelable: true
  });

  // public rulerChanged: boolean = false;
  // public rulerCreated: boolean = false;


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
  @Output() annotationCreated = new EventEmitter<Artifact>();

  init() {
    if (this._initialized) {
      return;
    }

    // renderer
    this._renderer = new THREE.WebGLRenderer({
      antialias: true,
      preserveDrawingBuffer: true,
    });
    this._renderer.autoClear = false;
    this._renderer.localClippingEnabled = true;
    this._renderer.setSize(
      this._domElement.clientWidth,
      this._domElement.clientHeight,
      false
    );
    this._renderer.domElement.setAttribute("style", "width:100%; height:100%;");
    this._renderer.setClearColor(0x121212, 1);
    this._renderer.domElement.id = this._targetID.toString(); // 0,1,2,3 view ID
    this._domElement.appendChild(this._renderer.domElement); // append canvas to main DOMelement

    // camera
    const width = this._domElement.clientWidth;
    const height = this._domElement.clientHeight;
    const aspect = width / height;
    const viewSize = 0.5 * width;
    this._camera = new AMI.OrthographicCamera(
      (aspect * viewSize) / -2,
      (aspect * viewSize) / 2,
      viewSize / 2,
      viewSize / -2
    );
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

    this._renderer.domElement.addEventListener(
      "click",
      this.onClick.bind(this)
    );

    // this.scene.add()

    this._measurement = null;

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
      ),
    };

    // init and zoom
    const canvas = {
      width: this._domElement.clientWidth,
      height: this._domElement.clientHeight,
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
      this._localizerHelper["plane" + (i + 1)] = localizers[i].plane;
      this._localizerHelper["color" + (i + 1)] = localizers[i].color;
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
        const targetPlane = targetLocalizersHelpers[i]["plane" + (j + 1)];
        if (
          targetPlane &&
          plane.x.toFixed(6) === targetPlane.x.toFixed(6) &&
          plane.y.toFixed(6) === targetPlane.y.toFixed(6) &&
          plane.z.toFixed(6) === targetPlane.z.toFixed(6)
        ) {
          targetLocalizersHelpers[i]["plane" + (j + 1)] = plane;
        }
      }
    }

    // update the geometry will create a new mesh
    this._localizerHelper.geometry = refHelper.slice.geometry;
  }

  updateClipPlane(clipPlane) {
    const vertices = this._stackHelper.slice.geometry.vertices;
    const p1 = new THREE.Vector3(
      vertices[0].x,
      vertices[0].y,
      vertices[0].z
    ).applyMatrix4(this._stackHelper._stack.ijk2LPS);
    const p2 = new THREE.Vector3(
      vertices[1].x,
      vertices[1].y,
      vertices[1].z
    ).applyMatrix4(this._stackHelper._stack.ijk2LPS);
    const p3 = new THREE.Vector3(
      vertices[2].x,
      vertices[2].y,
      vertices[2].z
    ).applyMatrix4(this._stackHelper._stack.ijk2LPS);

    clipPlane.setFromCoplanarPoints(p1, p2, p3);

    const cameraDirection = new THREE.Vector3(1, 1, 1);
    cameraDirection.applyQuaternion(this._camera.quaternion);

    if (cameraDirection.dot(clipPlane.normal) > 0) {
      clipPlane.negate();
    }

    // resize event
    this._renderer.domElement.addEventListener(
      "resize",
      this.onWindowResize,
      false
    );
  }

  render() {
    if (!this._initialized) {
      throw new UninitializedError();
    }

    this._controls.update();
    this._renderer.clear();
    this._renderer.render(this._scene, this._camera);

    // mesh
    // this._renderer.clearDepth();
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
    const width = this._renderer.domElement.clientWidth;
    const height = this._renderer.domElement.clientHeight;
    const aspect = width / height;
    const viewSize = 0.5 * width;
    this._camera.left = (aspect * viewSize) / -2;
    this._camera.right = (aspect * viewSize) / 2;
    this._camera.top = viewSize / 2;
    this._camera.bottom = viewSize / -2;
    this._camera.canvas.width = width;
    this._camera.canvas.height = height;
    this._camera.updateProjectionMatrix();
  }

  onScroll(event) {
    super.onScroll(event);

    const oldIndex = this._stackHelper.index;

    if (event.delta > 0) {
      if (
        this._stackHelper.index >=
        this._stackHelper.orientationMaxIndex - 1
      ) {
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
      type: "sliceIndexChangeStart",
      changes: {
        sliceOrientation: this._sliceOrientation,
        oldIndex: oldIndex,
        newIndex: newIndex,
      }
    });


    this._canvas.dispatchEvent({
      type: "sliceIndexChanged",
      changes: {
        sliceOrientation: this._sliceOrientation,
        oldIndex: oldIndex,
        newIndex: newIndex,
      }
    });
  }


  removeFromSliceChange(oldIndex) {
    if (this._artifactsOnMasterBranch.find((x) => x.sliceIndex == oldIndex)) {
      this._artifactsOnMasterBranch.filter((x) => x.sliceIndex == oldIndex).forEach((x) => this.removeElms(x));
    }
    // if (!this._canvas.provenance.graphLoaded && this._artifactsOnMasterBranch.filter((x) => x.sliceIndex == oldIndex).filter((x) => x.measurementType == 'freehand')) {
    //   (this._measurement as Freehand).widget.hide(); //id  push  in  window as any  store and retrieve t
    // }
  }

  renderFromSliceChange(newIndex) {
    if (this._artifactsOnMasterBranch.find((x) => x.sliceIndex == newIndex)) {
      this._artifactsOnMasterBranch.filter((x) => x.sliceIndex == newIndex).forEach((x) => this.renderElms(x));
    }
    // if (!this._canvas.provenance.graphLoaded && this._artifactsOnMasterBranch.filter((x) => x.sliceIndex == newIndex).filter((x) => x.measurementType == 'freehand')) {
    //   (this._measurement as Freehand).widget.show();
    // }
  }


  renderElms(artifact: Artifact) {
    // if (!this._artifactInit && !this._canvas.provenance.graphLoaded && artifact.measurementType === 'freehand') {
    //   (this._measurement as Freehand).widget.show();
    // } else 
    if (this._canvas.provenance.graphLoaded) {
      this.renderRestoredElms(artifact);
    } else if (!this._artifactInit && !this._canvas.provenance.graphLoaded) {
      for (let i = 0; i < artifact.elements.length; i++) {
        this._domElement.appendChild(artifact.elements[i]);
      }
    } else {
      this._artifactInit = false;
    }
  }


  removeElms(artifact: Artifact) {
    // if (artifact.measurementType === 'freehand') {
    //   (this._measurement as Freehand).widget.hide();
    // } else {
      if (this._canvas.provenance.graphLoaded) {
        this.removeRestoredElms(artifact);
      } else {
        for (let i = 0; i < artifact.elements.length; i++) {
          if (artifact.elements[i].parentNode) {
            this._domElement.removeChild(artifact.elements[i]);
          }
        }
      }
    }
  // }


  addArtifact = (artifact: Artifact) => {
    this.renderElms(artifact);
    this._artifactsOnMasterBranch.push(artifact);
  };

  removeArtifact = (artifact: Artifact) => {
    this.removeElms(artifact);
    this._artifactsOnMasterBranch = this._artifactsOnMasterBranch.filter((x) => x.id !== artifact.id);
  };



  renderRestoredElms(artifact: Artifact) {
      if (artifact.measurementType === 'ruler') {
        const ruler = new Ruler(this);
        ruler.widget._handles[0].worldPosition = artifact.metadata[0];
        ruler.widget._handles[1].worldPosition = artifact.metadata[1];
        ruler.simulateRuler(this.mouseDownEvent, this.mouseMoveEvent, this.mouseUpEvent);

      } else if (artifact.measurementType === 'angle') {
        const angle = new Angle(this);
        angle.widget._handles[0].worldPosition = artifact.metadata[0];
        angle.widget._handles[1].worldPosition = artifact.metadata[1];
        angle.simulateAngle(this.mouseDownEvent, this.mouseMoveEvent, this.mouseUpEvent);
        angle.widget._handles[2].worldPosition = artifact.metadata[2];
        angle.simulateAngle(this.mouseDownEvent, this.mouseMoveEvent, this.mouseUpEvent);

      } else if (artifact.measurementType === 'voxelprobe') {
        const voxelprobe = new Voxelprobe(this);
        voxelprobe.widget.children[0].worldPosition = artifact.metadata[0];
        voxelprobe.simulateVoxelprobe(this.mouseDownEvent, this.mouseUpEvent);

      } else if (artifact.measurementType === 'annotation') {
        const annotation = new Annotation(this);
        annotation.widget.children[0].worldPosition = artifact.metadata[0];
        annotation.widget.children[1].worldPosition = artifact.metadata[1];
        annotation.simulateAnnotation(this.mouseDownEvent, this.mouseMoveEvent, this.mouseUpEvent);
        document.getElementById('textBox ' + this.annotationCounter).innerText = artifact.metadata[2];

      // } else if (artifact.measurementType === 'freehand') {
      //   const freehand = new Freehand(this);
      //   for (let i = 0; i < artifact.elmHTML.length; i++) {
      //     freehand.widget._handles[i].worldPosition = artifact.metadata[i];
      //     // freehand.simulateFreehand(this.mouseDownEvent, this.mouseMoveEvent, this.mouseUpEvent);
      //   }
      }
  }

  removeRestoredElms(artifact: Artifact) {
    for (let i = 0; i < artifact.elements.length + 1; i++) {
      if (this._domElement.children.length > 1) {
        this._domElement.removeChild(this._domElement.lastChild);
      }
    }
  }




  // Ruler

  startRuler = (evt) => {
    this._measurement = new Ruler(this, evt);
    this._domElement.removeEventListener("mousedown", this.startRuler);
    this.emitRuler(this._measurement);
  };

  emitRuler(measurement: Ruler) {
    this._artifactID = this._artifactID + 1;
    measurement.artifact = {
      id: this._artifactID,
      measurementType: "ruler",
      sliceIndex: this._stackHelper.index,
      viewName: this._domID,
      elements: [
        measurement.widget._line,
        measurement.widget._label,
        measurement.widget.children[0]._dom,
        measurement.widget.children[1]._dom,
      ],
      elmHTML: [
        measurement.widget._line.outerHTML,
        measurement.widget._label.outerHTML,
        measurement.widget.children[0]._dom.outerHTML,
        measurement.widget.children[1]._dom.outerHTML
      ],
      metadata: [
        measurement.widget._handles[0].worldPosition,
        measurement.widget._handles[1].worldPosition
      ]
    };
    this._artifactInit = true;
    this.addArtifact(measurement.artifact);
    this.artifactCreated.emit(measurement.artifact);
    this._canvas.settings.rulerMode = false;
  }


  // Angle

  startAngle = (evt) => {
    this._measurement = new Angle(this, evt);
    this._domElement.removeEventListener("mousedown", this.startAngle);
    this.emitAngle(this._measurement);
  };

  emitAngle(measurement: Angle) {
    this._artifactID = this._artifactID + 1;
    measurement.artifact = {
      id: this._artifactID,
      measurementType: "angle",
      sliceIndex: this._stackHelper.index,
      viewName: this._domID,
      elements: [
        measurement.widget._line,
        measurement.widget._label,
        measurement.widget._line2,
        measurement.widget.children[0]._dom,
        measurement.widget.children[1]._dom,
        measurement.widget.children[2]._dom
      ],
      elmHTML: [
        measurement.widget._line.outerHTML,
        measurement.widget._label.outerHTML,
        measurement.widget._line2.outerHTML,
        measurement.widget.children[0]._dom.outerHTML,
        measurement.widget.children[1]._dom.outerHTML,
        measurement.widget.children[2]._dom.outerHTML
      ],
      metadata: [
        measurement.widget._handles[0].worldPosition,
        measurement.widget._handles[1].worldPosition,
        measurement.widget._handles[2].worldPosition
      ]
    };
    this._artifactInit = true;
    this.addArtifact(measurement.artifact);
    this.artifactCreated.emit(measurement.artifact);
    this._canvas.settings.angleMode = false;
  }


  // Freehand

  // startFreehand = (evt) => {
  //   this._measurement = new Freehand(this, evt);
  //   this._domElement.removeEventListener("mousedown", this.startFreehand);
  //   this.emitFreehand(this._measurement);
  // }

  // emitFreehand(measurement: Freehand) {
  //   this._artifactID = this._artifactID + 1;
  //   const handles = measurement.widget.children.filter((x) => x !== null);
  //   for (
  //     let i = 0, length = measurement.widget.children.length; i < length; i++) {
  //     handles.push(measurement.widget.children[i]._dom);
  //   }
  //   const elems = [
  //     measurement.widget._label,
  //     ...measurement.widget._lines,
  //     ...handles
  //   ];

  //   measurement.artifact = {
  //     id: this._artifactID,
  //     measurementType: "freehand",
  //     sliceIndex: measurement.index,
  //     viewName: this._domID,
  //     elements: elems,
  //     elmHTML: [
  //       ...handles
  //     ],
  //     metadata: [
  //       ...handles
  //     ]
  //   };
  //   this._artifactInit = true;
  //   this.addArtifact(measurement.artifact);
  //   this.artifactCreated.emit(measurement.artifact);
  //   this._canvas.settings.freehandMode = false;
  // }



  // VoxelProbe

  startVoxelprobe = (evt) => {
    this._measurement = new Voxelprobe(this, evt);
    this._domElement.removeEventListener("mousedown", this.startVoxelprobe);
    this.emitVoxelprobe(this._measurement);
  }

  emitVoxelprobe(measurement: Voxelprobe) {
    this._artifactID = this._artifactID + 1;
    measurement.artifact = {
      id: this._artifactID,
      measurementType: "voxelprobe",
      sliceIndex: this._stackHelper.index,
      viewName: this._domID,
      elements: [
        measurement.widget._label,
        measurement.widget.children[0]._dom
      ],
      elmHTML: [
        measurement.widget._label.outerHTML,
        measurement.widget.children[0]._dom.outerHTML
      ],
      metadata: [
        measurement.widget.children[0].worldPosition
      ]
    };
    this._artifactInit = true;
    this.addArtifact(measurement.artifact);
    this.artifactCreated.emit(measurement.artifact);
    this._canvas.settings.voxelprobeMode = false;
  }


  // Annotation

  startAnnotation = (evt) => {
    this._measurement = new Annotation(this, evt);
    this._domElement.removeEventListener("mousedown", this.startAnnotation);
    this.emitAnnotation(this._measurement);
  }

  emitAnnotation(measurement: Annotation) {
    const handles = measurement.widget.children.filter((x) => x !== null);
    for (let i = 0, length = handles.length; i < length; i++) {
      handles.push(measurement.widget.children[i]._dom);
    }
    const elems = [
      measurement.widget._line,
      measurement.widget._label,
      measurement.widget._dashline,
      ...handles
    ];

    measurement.widget._label.id = 'textBox ' + this.annotationCounter;

    this._artifactID = this._artifactID + 1;
    measurement.artifact = {
      id: this._artifactID,
      measurementType: "annotation",
      sliceIndex: this._stackHelper.index,
      viewName: this._domID,
      elements: elems.filter((x) => x instanceof HTMLElement),
      elmHTML: [
        handles[0].outerHTML,
        handles[1].outerHTML,
        measurement.widget._label.outerHTML,
        measurement.widget._dashline.outerHTML
      ],
      metadata: [
        handles[0].worldPosition,
        handles[1].worldPosition
            ]
    };
    this._artifactInit = true;
    this.addArtifact(measurement.artifact);
    this.annotationCreated.emit(measurement.artifact);
    this._canvas.settings.annotationMode = false;
  }


  get sliceOrientation() {
    return this._sliceOrientation;
  }

  set rulerMode(isEnabled: boolean) {
    this._rulerMode = isEnabled;
    if (isEnabled) {
      // create a ruler on first click
      this.domElement.addEventListener("mousedown", this.startRuler);
      // this.domElement.addEventListener('contextmenu', this.deleteRuler);
    } else {
      this.domElement.removeEventListener("mousedown", this.startRuler);
      // this.domElement.removeEventListener('contextmenu', this.deleteRuler);
    }
  }

  set angleMode(isEnabled: boolean) {
    this._angleMode = isEnabled;
    if (isEnabled) {
      // create a ruler on first click
      this.domElement.addEventListener("mousedown", this.startAngle);
      // this.domElement.addEventListener('shiftKey', this.deleteAngle);
    } else {
      this.domElement.removeEventListener("mousedown", this.startAngle);
      // this.domElement.removeEventListener('contextmenu', this.deleteAngle);
    }
  }

  // set freehandMode(isEnabled: boolean) {
  //   this._freehandMode = isEnabled;
  //   if (isEnabled) {
  //     // create a ruler on first click
  //     this.domElement.addEventListener("mousedown", this.startFreehand);
  //     // this.domElement.addEventListener('contextmenu', this.deleteFreehand);
  //   } else {
  //     this.domElement.removeEventListener("mousedown", this.startFreehand);
  //     // this.domElement.removeEventListener('contextmenu', this.deleteFreehand);
  //   }
  // }

  set voxelprobeMode(isEnabled: boolean) {
    this._voxelprobeMode = isEnabled;
    if (isEnabled) {
      // create a ruler on first click
      this.domElement.addEventListener("mousedown", this.startVoxelprobe);
      // this.domElement.addEventListener('contextmenu', this.deleteVoxelprobe);
    } else {
      this.domElement.removeEventListener("mousedown", this.startVoxelprobe);
      // this.domElement.removeEventListener('contextmenu', this.deleteVoxelprobe);
    }
  }

  set annotationMode(isEnabled: boolean) {
    this._annotationMode = isEnabled;
    if (isEnabled) {
      // create a ruler on first click
      this.domElement.addEventListener("mousedown", this.startAnnotation);
      // this.domElement.addEventListener('contextmenu', this.deleteAnnotation);
    } else {
      this.domElement.removeEventListener("mousedown", this.startAnnotation);
      // this.domElement.removeEventListener('contextmenu', this.deleteAnnotation);
    }
  }
}