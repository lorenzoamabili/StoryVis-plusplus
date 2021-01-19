import * as THREE from "three";
import * as AMI from "ami.js";
import { IAMIRenderer, View, ISlicePosition } from "./utils/types";
import { AMIRenderer } from "./amiRenderer";
import { EventEmitter, Output, ViewChild, Component } from "@angular/core";
import { UninitializedError } from "./utils/exceptions";
import Ruler from "./ruler";
import Angle from "./angle";
// import Freehand from "./freehand";
import Voxelprobe from "./voxelprobe";
import Annotation from "./annotation";
import { Artifact } from "@visualstorytelling/provenance-core/src/api";

// @Component({
//   template: ''
// })

var artifactID: number = -1;

export class Renderer2D extends AMIRenderer implements IAMIRenderer {
  public _measurement: Ruler | Angle | Voxelprobe | Annotation | null = null;   // Freehand |
  public _measurements: (Ruler | Angle | Voxelprobe | Annotation | null)[] = [];     // Freehand | 

  public oldSlicePosition: ISlicePosition;
  public oldCameraZoom: number;
  public originalSlicePosition: ISlicePosition;
  public originalCameraZoom: number;

  public _artifacts: Artifact[] = [];
  public _deletedArtifacts: Artifact[] = [];
  private _artifactInit: boolean = false;
  public annotationCounter: number = 0;

  public findingCoord: {
    coordinates: { x: Number, y: Number, z: Number }[],
    sliceIndex: Number,
    measurementID: Number,
    viewName: String,
    measurementType: String
  };
  public _view: View;

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


  constructor(view: View) {
    super(view);
    // this._domElement = <HTMLElement>document.getElementById(view.domId);
    this._color = view.color; // 0x121212
    this._sliceOrientation = view.sliceOrientation; // 'axial'
    this._sliceColor = view.sliceColor; // 0xff1744
    this._targetID = view.targetID; // 1
    this._view = view;
  }


  @Output() artifactCreated = new EventEmitter<Artifact>();
  @Output() artifactDeleted = new EventEmitter<Artifact>();

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
    this._renderer.domElement.setAttribute("style", "width:100%; height:100%;");
    this._renderer.setClearColor(0x121212, 1);
    this._renderer.domElement.id = this._targetID.toString(); // 0,1,2,3 view ID
    this._domElement.appendChild(this._renderer.domElement); // append canvas to main DOMelement

    // camera
    const width = this._domElement.clientWidth;
    const height = this._domElement.clientHeight;
    const aspect = width / height;
    const viewSize = 0.5 * width;


    // rough attempt to solve the flickering problem
    if (this._canvas.studyStarted) {
      this._camera = new AMI.OrthographicCamera(
        (aspect * viewSize) / -2,
        (aspect * viewSize) / 2,
        viewSize / 2,
        viewSize / -2,
        1,
        this._targetID === 0 ? 5000 : 500
      );
    } else {
      this._camera = this._targetID === 3 ?
        new AMI.OrthographicCamera(
          (aspect * viewSize) / -2,
          (aspect * viewSize) / 2,
          viewSize / 2,
          viewSize / -2,
          10,
          1000
        ) :
        new AMI.OrthographicCamera(
          (aspect * viewSize) / -2,
          (aspect * viewSize) / 2,
          viewSize / 2,
          viewSize / -2
        )
    }

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

    // this._renderer.domElement.addEventListener("click", this.onClick.bind(this));
    this._renderer.domElement.addEventListener("mouseup", this.onPlane.bind(this));

    // this.scene.add()

    this._initialized = true;
  }

  initHelpersStack(stack) {
    if (!this._initialized) {
      throw new UninitializedError();

    }

    this._stackHelper = new AMI.StackHelper(stack);
    this._stackHelper.bbox.visible = false;
    this._stackHelper.borderColor = this._sliceColor;

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

    this.originalSlicePosition = this.getSlicePosition();
    this.originalCameraZoom = this.camera.zoom;
    this.oldSlicePosition = this.originalSlicePosition;
    this.oldCameraZoom = this.originalCameraZoom;
  }


  updateClipPlane(clipPlane) {
    // this._stackHelper.slice.verticesNeedUpdate = true;
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

    if (this._measurements.length > 0 && this._artifacts.length > 0) {
      for (const measurement of this._measurements) {
        measurement.widget.update();
      }
    }

    this._camera.updateProjectionMatrix();



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
  }

  onWindowResize() {
    const width = this._renderer.domElement.clientWidth;
    const height = this._renderer.domElement.clientHeight;
    this._camera.aspect = width / height;
    this._camera.updateProjectionMatrix();
    this._renderer.setSize(width, height, false);
  }

  onShiftClick(event) {
    super.onShiftClick(event);
  }


  onScroll(event: any) {
    // super.onScroll(event);
    const oldIndex = this._stackHelper.index;

    if (event.delta > 0) {
      if (this._stackHelper.index >= this._stackHelper.orientationMaxIndex - 1) {
        return;
      }
      this._stackHelper.index += 1;
      this.removeFromSliceChange(oldIndex);
    } else {
      if (this._stackHelper.index <= 1) {
        return;
      }
      this._stackHelper.index -= 1;
      this.removeFromSliceChange(oldIndex);
    }

    const newIndex = this._stackHelper.index;

    this._canvas.dispatchEvent({
      type: "sliceIndexChangeStart",
      changes: {
        sliceOrientation: this.sliceOrientation,
        oldIndex: oldIndex,
        newIndex: newIndex
      }
    });


    this._canvas.dispatchEvent({
      type: "sliceIndexChanged",
      changes: {
        sliceOrientation: this.sliceOrientation,
        oldIndex: oldIndex,
        newIndex: newIndex
      }
    });
  }



  onPlane(event: any) {
    if (!event.shiftKey && !event.ctrlKey && !event.altKey) {
      if (!this._canvas.settings.rulerMode && !this._canvas.settings.angleMode && !this._canvas.settings.voxelprobeMode && !this._canvas.settings.annotationMode) {
        switch (event.button) {
          case 0:
            this._canvas.dispatchEvent({
              type: "sliceDragChangeStart",
              changes: {
                sliceOrientation: this._sliceOrientation,
                oldSlicePosition: this.oldSlicePosition
              }
            });

            this._canvas.dispatchEvent({
              type: "sliceDragChanged",
              changes: {
                sliceOrientation: this._sliceOrientation,
                newSlicePosition: this.getSlicePosition()
              }
            });
            break;


          case 2:
            this._canvas.dispatchEvent({
              type: "sliceZoomChangeStart",
              changes: {
                sliceOrientation: this._sliceOrientation,
                oldZoom: this.oldCameraZoom
              }
            });

            this._canvas.dispatchEvent({
              type: "sliceZoomChanged",
              changes: {
                sliceOrientation: this._sliceOrientation,
                newZoom: this._camera.zoom
              }
            });
            break;

        }

        this.oldSlicePosition = this.getSlicePosition();
        this.oldCameraZoom = this._camera.zoom;

      } else {
        this._canvas.settings.rulerMode = false;
        this._canvas.settings.angleMode = false;
        this._canvas.settings.voxelprobeMode = false;
        this._canvas.settings.annotationMode = false;
      }
    }
  }



  getSlicePosition() {
    const position = this._camera.position.toArray();
    const direction = this._controls.target.toArray();
    const slicePosition = { position, direction };
    return slicePosition;
  }

  setSlicePosition(newSlicePosition: ISlicePosition, within: number) {
    this.changeCamera2D(
      new THREE.Vector3(newSlicePosition.position[0], newSlicePosition.position[1], newSlicePosition.position[2]),
      new THREE.Vector3(newSlicePosition.direction[0], newSlicePosition.direction[1], newSlicePosition.direction[2]),
      within > 0 ? within : 1000);
  }


  setSliceZoom(cameraZoom: number, within: number) {
    this.changeCamera2DZoom(cameraZoom, within > 0 ? within : 1000);
  }


  changeCamera2D(newPosition: THREE.Vector3, newTarget: THREE.Vector3, milliseconds: number, done?: () => void) {
    let changeTimeout;
    if (this._controls.target.equals(newTarget) && this.camera.position.equals(newPosition)) {
      return;
    }
    if (milliseconds <= 0) {
      this._controls.target.copy(newTarget);
      this.camera.position.copy(newPosition);
      this.camera.lookAt(this._controls.target);
    } else {
      if (changeTimeout !== undefined) {
        clearInterval(changeTimeout);
        changeTimeout = undefined;
      }
      let changeTime = 0;
      const delta = 30 / milliseconds;
      changeTimeout = setInterval((fromTarget, fromPosition, toTarget, toPosition) => {
        const t = changeTime;
        const interPolateTime = t < .5 ? 2 * t * t : -1 + (4 - 2 * t) * t; //  ease in/out function

        const nextPosition = fromPosition.clone();
        const distancePosition = toPosition.clone();
        distancePosition.sub(fromPosition);
        nextPosition.addScaledVector(distancePosition, interPolateTime);

        const nextTarget = fromTarget.clone();
        const distanceTarget = toTarget.clone();
        distanceTarget.sub(fromTarget);
        nextTarget.addScaledVector(distanceTarget, interPolateTime);

        this.changeCamera2D(nextPosition, nextTarget, 0);
        changeTime += delta;
        if (changeTime > 1.0) {
          this.changeCamera2D(toPosition, toTarget, 0);
          clearInterval(changeTimeout);
          changeTimeout = undefined;
          if (done) {
            done();
          }
        }
      }, 30, this._controls.target.clone(), this.camera.position.clone(), newTarget, newPosition);
    }
  }



  changeCamera2DZoom(newZoom: number, milliseconds: number, done?: () => void) {
    let changeTimeout;
    if (this._camera.zoom === newZoom) {
      return;
    }
    if (milliseconds <= 0) {
      this.camera.zoom = newZoom;
      this.camera.updateProjectionMatrix();
    } else {
      if (changeTimeout !== undefined) {
        clearInterval(changeTimeout);
        changeTimeout = undefined;
      }
      let changeTime = 0;
      const delta = 30 / milliseconds;
      changeTimeout = setInterval((fromZoom, toZoom) => {
        const t = changeTime;
        const interPolateTime = t < .5 ? 2 * t * t : -1 + (4 - 2 * t) * t; //  ease in/out function

        const distanceZoom = toZoom - fromZoom;
        const nextZoom = fromZoom + (distanceZoom * interPolateTime);

        this.changeCamera2DZoom(nextZoom, 0);
        changeTime += delta;
        if (changeTime > 1.0) {
          this.changeCamera2DZoom(toZoom, 0);
          clearInterval(changeTimeout);
          changeTimeout = undefined;
          if (done) {
            done();
          }
        }

      }, 30, this.camera.zoom, newZoom);
    }
  }


  removeFromSliceChange(oldIndex) {
    if(this._artifacts.find((artifact) => artifact.sliceIndex === oldIndex)) {
      this._artifacts.filter((artifact) => artifact.sliceIndex === oldIndex).forEach((artifact) => this.removeElms(artifact));
    }
  }

  renderFromSliceChange(newIndex) {
    if(this._artifacts.find((artifact) => artifact.sliceIndex === newIndex)) {
      this._artifacts.filter((artifact) => artifact.sliceIndex === newIndex).forEach((artifact) => this.renderElms(artifact));
    }
  }


  renderElms(artifact: Artifact) {
    if (this._artifactInit) {
      this._measurements.find((measurement) => measurement.artifact.id === artifact.id).widget.show();
    }
  }

  removeElms(artifactToRemove: Artifact) {
    this._measurements.find((measurement) => measurement.artifact.id === artifactToRemove.id).widget.hide();
  }


  addArtifact(artifact: Artifact) {
    this.renderElms(artifact);
    this._artifacts.push(artifact);
  };

  removeArtifact(artifactToRemove: Artifact) {
    this.removeElms(artifactToRemove);
    this._artifacts = this._artifacts.filter((artifact) => artifact.id !== artifactToRemove.id);

    // if (artifact.sliceOrientation === 'axial') {
    //   this._artifactsAxial = this._artifactsAxial.filter((x) => x.id !== artifact.id);
    // } else if (artifact.sliceOrientation === 'coronal') {
    //   this._artifactsCoronal = this._artifactsCoronal.filter((x) => x.id !== artifact.id);
    // } else if (artifact.sliceOrientation === 'sagittal') {
    //   this._artifactsSagittal = this._artifactsSagittal.filter((x) => x.id !== artifact.id);
    // }
  };


  createArtifact(artifact: Artifact) {
    //not necessary, but make the data collection easier
    this.findingCoord = {} as any;
    this.findingCoord.coordinates = [...artifact.metadata];
    this.findingCoord.measurementID = artifact.id;
    this.findingCoord.sliceIndex = artifact.sliceIndex;
    this.findingCoord.viewName = artifact.sliceOrientation;
    this.findingCoord.measurementType = artifact.measurementType;
    this._canvas.provenance.findingsCoord.push(this.findingCoord);

    this.addArtifact(artifact);
    this.artifactCreated.emit(artifact);
    this._artifactInit = true;

    this.deleteArtifact();
  }

  deleteArtifact(artifact?: Artifact) {
    const that = this;
    if (artifact) {
      this.removeArtifact(artifact);
    }
    else {
      that._artifacts.forEach(artifact => artifact.elements.forEach(elem => elem.addEventListener('contextmenu', (e) => {
        if (e.altKey) {
          const artifactToDelete = that._artifacts.find(artifact => artifact.elements.includes(e.target as any));
          that.removeArtifact(artifactToDelete);
          that.artifactDeleted.emit(artifactToDelete);
        }
      })));
    }
  }

  // Ruler
  startRuler = (evt) => {
    this._measurement = new Ruler(this, evt);
    this._measurements.push(this._measurement);
    this._domElement.removeEventListener("mousedown", this.startRuler);

    artifactID = artifactID + 1;
    this._measurement.artifact = {
      id: artifactID,
      measurementType: "Distance",
      sliceIndex: this._stackHelper.index,
      sliceOrientation: this._sliceOrientation,
      elements: [
        this._measurement.widget._line,
        this._measurement.widget._label,
        this._measurement.widget.children[0]._dom,
        this._measurement.widget.children[1]._dom,
      ],
      elmHTML: [
        this._measurement.widget._line.outerHTML,
        this._measurement.widget._label.outerHTML,
        this._measurement.widget.children[0]._dom.outerHTML,
        this._measurement.widget.children[1]._dom.outerHTML
      ],
      metadata: [
        this._measurement.widget._handles[0].worldPosition,
        this._measurement.widget._handles[1].worldPosition
      ]
    };
    this.createArtifact(this._measurement.artifact);
  }



  // Angle
  startAngle = (evt) => {
    this._measurement = new Angle(this, evt);
    this._measurements.push(this._measurement);
    this._domElement.removeEventListener("mousedown", this.startAngle);

    artifactID = artifactID + 1;
    this._measurement.artifact = {
      id: artifactID,
      measurementType: "Angle",
      sliceIndex: this._stackHelper.index,
      sliceOrientation: this._sliceOrientation,
      elements: [
        this._measurement.widget._line,
        this._measurement.widget._label,
        this._measurement.widget._line2,
        this._measurement.widget.children[0]._dom,
        this._measurement.widget.children[1]._dom,
        this._measurement.widget.children[2]._dom
      ],
      elmHTML: [
        this._measurement.widget._line.outerHTML,
        this._measurement.widget._label.outerHTML,
        this._measurement.widget._line2.outerHTML,
        this._measurement.widget.children[0]._dom.outerHTML,
        this._measurement.widget.children[1]._dom.outerHTML,
        this._measurement.widget.children[2]._dom.outerHTML
      ],
      metadata: [
        this._measurement.widget._handles[0].worldPosition,
        this._measurement.widget._handles[1].worldPosition,
        this._measurement.widget._handles[2].worldPosition
      ]
    };
    this.createArtifact(this._measurement.artifact);
  }

  // Freehand

  // startFreehand = (evt) => {
  //   this._measurement = new Freehand(this, evt);
  //   this._measurements.push(this._measurement);
  //   this._domElement.removeEventListener("mousedown", this.startFreehand);

  //   this._artifactID = this._artifactID + 1;
  //   const handles = this._measurement.widget.children.filter((x) => x !== null);
  //   for (
  //     let i = 0, length = this._measurement.widget.children.length; i < length; i++) {
  //     handles.push(this._measurement.widget.children[i]._dom);
  //   }
  //   const handlesCoord = this._measurement.widget.children.filter((x) => x !== null);
  //   for (
  //     let i = 0, length = this._measurement.widget.children.length; i < length; i++) {
  //     handlesCoord.push(this._measurement.widget.children[i].worldPosition);
  //   }
  //   const elems = [
  //     this._measurement.widget._label,
  //     ...this._measurement.widget._lines,
  //     ...handles
  //   ];

  //   this._measurement.artifact = {
  //     id: this._artifactID,
  //     measurementType: "freehand",
  //     sliceIndex: this._measurement.index,
  //     sliceOrientation: this._sliceOrientation,
  //     elements: elems,
  //     elmHTML: [
  //       ...handles
  //     ],
  //     metadata: [
  //       ...handlesCoord
  //     ]
  //   };
  //   this.createArtifact(this._measurement.artifact);
  //   this._canvas.settings.freehandMode = false;
  // }



  // VoxelProbe
  startVoxelprobe = (evt) => {
    this._measurement = new Voxelprobe(this, evt);
    this._measurements.push(this._measurement);
    this._domElement.removeEventListener("mousedown", this.startVoxelprobe);

    artifactID = artifactID + 1;
    this._measurement.artifact = {
      id: artifactID,
      measurementType: "Density",
      sliceIndex: this._stackHelper.index,
      sliceOrientation: this._sliceOrientation,
      elements: [
        this._measurement.widget._label,
        this._measurement.widget.children[0]._dom
      ],
      elmHTML: [
        this._measurement.widget._label.outerHTML,
        this._measurement.widget.children[0]._dom.outerHTML
      ],
      metadata: [
        this._measurement.widget.children[0].worldPosition
      ]
    };
    this.createArtifact(this._measurement.artifact);
  }


  // Annotation
  startAnnotation = (evt) => {
    this._measurement = new Annotation(this, evt);
    this._measurements.push(this._measurement);
    this._domElement.removeEventListener("mousedown", this.startAnnotation);

    const handles = this._measurement.widget.children.filter((x) => x !== null);
    for (let i = 0, length = handles.length; i < length; i++) {
      handles.push(this._measurement.widget.children[i]._dom);
    }
    const elems = [
      this._measurement.widget._line,
      this._measurement.widget._label,
      this._measurement.widget._dashline,
      ...handles
    ];

    this._measurement.widget._label.id = 'textBox ' + this.annotationCounter;

    artifactID = artifactID + 1;
    this._measurement.artifact = {
      id: artifactID,
      measurementType: "Annotation",
      sliceIndex: this._stackHelper.index,
      sliceOrientation: this._sliceOrientation,
      elements: elems.filter((x) => x instanceof HTMLElement),
      elmHTML: [
        handles[0].outerHTML,
        handles[1].outerHTML,
        this._measurement.widget._label.outerHTML,
        this._measurement.widget._dashline.outerHTML
      ],
      metadata: [
        handles[0].worldPosition,
        handles[1].worldPosition
      ]
    };
    this.createArtifact(this._measurement.artifact);
  }


  get sliceOrientation() {
    return this._sliceOrientation;
  }


  set rulerMode(isEnabled: boolean) {
    this._canvas.settings.rulerOn = isEnabled;
    if (isEnabled) {
      this.domElement.addEventListener("mousedown", this.startRuler);
    } else {
      this.domElement.removeEventListener("mousedown", this.startRuler);
    }
  }

  set angleMode(isEnabled: boolean) {
    this._canvas.settings.angleOn = isEnabled;
    if (isEnabled) {
      this.domElement.addEventListener("mousedown", this.startAngle);
    } else {
      this.domElement.removeEventListener("mousedown", this.startAngle);
    }
  }

  // set freehandMode(isEnabled: boolean) {
  //   this._canvas.settings.freehandOn= isEnabled;
  //   if (isEnabled) {
  //     this.domElement.addEventListener("mousedown", this.startFreehand);
  //   } else {
  //     this.domElement.removeEventListener("mousedown", this.startFreehand);
  //   }
  // }

  set voxelprobeMode(isEnabled: boolean) {
    this._canvas.settings.voxelprobeOn = isEnabled;
    if (isEnabled) {
      this.domElement.addEventListener("mousedown", this.startVoxelprobe);
    } else {
      this.domElement.removeEventListener("mousedown", this.startVoxelprobe);
    }
  }

  set annotationMode(isEnabled: boolean) {
    this._canvas.settings.annotationOn = isEnabled;
    if (isEnabled) {
      this.domElement.addEventListener("mousedown", this.startAnnotation);
    } else {
      this.domElement.removeEventListener("mousedown", this.startAnnotation);
    }
  }
}