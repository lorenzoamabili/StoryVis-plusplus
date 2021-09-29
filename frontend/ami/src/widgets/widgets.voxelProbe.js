import { widgetsBase } from './widgets.base';
import { widgetsHandle as widgetsHandleFactory } from './widgets.handle';
import ModelsVoxel from '../models/models.voxel';
import CoreUtils from '../core/core.utils';

/**
 * @module widgets/voxelProbe
 */
const widgetsVoxelprobe = (three = window.THREE) => {
  if (three === undefined || three.Object3D === undefined) {
    return null;
  }

  const Constructor = widgetsBase(three);
  return class extends Constructor {
    constructor(targetMesh, controls, params = {}) {
      super(targetMesh, controls, params);

      this._widgetType = 'VoxelProbe';

      // incoming parameters (optional: worldPosition)
      this._stack = params.stack; // required

      this._initialized = false; // set to true when the name of the label is entered
      this._movinglabel = null; // bool that turns true when the label is moving with the mouse
      this._labelmoved = false; // bool that turns true once the label is moved by the user (at least once)
      this._labelhovered = false;
      this._manuallabeldisplay = false; // Make true to force the label to be displayed

      this._container.style.cursor = 'pointer';
      this._controls.enabled = false; // controls should be disabled for widgets with a single handle
      this._active = true;
      this._moving = true;
      this._domHovered = false;

      // dom stuff
      this._dashline = null;
      this._label = null;
      this._labeltext = null;
      this._labelTextBox = null;

      this._labelOffset = new three.Vector3(); // difference between label center and second handle
      this._mouseLabelOffset = new three.Vector3(); // difference between mouse coordinates and label center

      // handle (represent voxel)
      const WidgetsHandle = widgetsHandleFactory(three);
      this._handle = new WidgetsHandle(targetMesh, controls, params);
      this.add(this._handle);

      this._moveHandle = new WidgetsHandle(targetMesh, controls, params);
      this.add(this._moveHandle);
      this._moveHandle.hide();

      this.create();
      this.initOffsets();

      this.onResize = this.onResize.bind(this);
      this.onMove = this.onMove.bind(this);
      this.onHoverlabel = this.onHoverlabel.bind(this);
      this.notonHoverlabel = this.notonHoverlabel.bind(this);

      // event listeners
      this.addEventListeners();
    }

    addEventListeners() {
      window.addEventListener('resize', this.onResize);

      this._label.addEventListener('mouseenter', this.onHoverlabel);
      this._label.addEventListener('mouseleave', this.notonHoverlabel);
      this._label.addEventListener('dblclick', this.changelabeltext);

      this._container.addEventListener('wheel', this.onMove);
    }

    removeEventListeners() {
      window.removeEventListener('resize', this.onResize);

      this._label.removeEventListener('mouseenter', this.onHoverlabel);
      this._label.removeEventListener('mouseleave', this.notonHoverlabel);
      this._label.removeEventListener('dblclick', this.changelabeltext);

      this._container.removeEventListener('wheel', this.onMove);
    }

    onResize() {
      this.initOffsets();
    }

    onHoverlabel() {
      // this function is called when mouse enters the label with "mouseenter" event
      this._labelhovered = true;
      this._container.style.cursor = 'pointer';
    }

    notonHoverlabel() {
      // this function is called when mouse leaves the label with "mouseleave" event
      this._labelhovered = false;
      this._container.style.cursor = 'default';
    }

    onStart(evt) {
      if (this._labelhovered) {
        // if label hovered then it should be moved
        // save mouse coordinates offset from label center
        const offsets = this.getMouseOffsets(evt, this._container);
        const paddingPoint = this._handle.screenPosition.clone().sub(this._labelOffset);

        this._mouseLabelOffset = new three.Vector3(
          offsets.screenX - paddingPoint.x,
          offsets.screenY - paddingPoint.y,
          0
        );
        this._movinglabel = true;
        this._labelmoved = true;
      }

      this._moveHandle.onMove(evt, true);
      this._handle.onStart(evt);

      this._active = this._handle.active || this._domHovered;

      if (this._domHovered) {
        this._moving = true;
        this._controls.enabled = false;
      }

      this.update();
    }

    onMove(evt) {
      if (this._movinglabel) {
        const offsets = this.getMouseOffsets(evt, this._container);

        this._labelOffset = new three.Vector3(
          this._handle.screenPosition.x - offsets.screenX + this._mouseLabelOffset.x,
          this._handle.screenPosition.y - offsets.screenY + this._mouseLabelOffset.y,
          0
        );
        this._controls.enabled = false;
      }

      if (this._active) {
        const prevPosition = this._moveHandle.worldPosition.clone();

        this._dragged = true;
        this._moveHandle.onMove(evt, true);
        this._hovered = this._handle.hovered || this._labelhovered;
        
        if (this._moving) {
          this._handle.worldPosition.add(this._moveHandle.worldPosition.clone().sub(prevPosition));
        }
      } else {
        this.onHover(null);
      }

      this._handle.onMove(evt);
      this.update();
    }

    onEnd() {
      this._handle.onEnd(); // First Handle

      // if (!this._dragged && this._active && this._initialized) {
      //   this._selected = !this._selected; // change state if there was no dragging
      //   this._handle.selected = this._selected;
      // }

      if (this._initialized) {
        // this._labelOffset = this._handle.screenPosition
        //   .clone()
        //   .multiplyScalar(0.5);
        this.setlabeltext();
      }


      this._initialized = true;
      this._active = this._handle.active;
      this._dragged = false;
      this._movinglabel = false;
      this._moving = false;

      this.update();
    }

    onHover(evt) {
      if (evt) {
        this.hoverDom(evt);
      }

      this._hovered = this._handle.hovered || this._domHovered;
      this._container.style.cursor = this._hovered ? 'pointer' : 'default';
    }

    hoverDom(evt) {
      this._domHovered = evt.type === 'mouseenter';
    }


    create() {
      this.createVoxel();
      this.createDOM();
    }

    createVoxel() {
      this._voxel = new ModelsVoxel();
      this._voxel.id = this.id;
    }

    createDOM() {
      this._dashline = document.createElement('div');
      this._dashline.className = 'widgets-dashline';
      this._container.appendChild(this._dashline);

      // measurements
      let measurementsContainer = document.createElement('div');
      // LPS
      // let lpsContainer = document.createElement('div');
      // lpsContainer.className = 'lpsPosition';
      // measurementsContainer.appendChild(lpsContainer);
      // IJK
      // let ijkContainer = document.createElement('div');
      // ijkContainer.className = 'ijkPosition';
      // measurementsContainer.appendChild(ijkContainer);
      // Value
      let valueContainer = document.createElement('div');
      valueContainer.className = 'value';
      measurementsContainer.appendChild(valueContainer);

      this._labelTextBox = document.createElement('div');
      this._labelTextBox.className = 'valueText';

      this._label = document.createElement('div');
      this._label.className = 'widgets-label';
      this._label.appendChild(measurementsContainer);
      this._label.appendChild(this._labelTextBox);
      this._container.appendChild(this._label);


      this.updateDOMColor();
    }


    update() {
      this.updateColor();

      this._handle.update();
      this._worldPosition.copy(this._handle.worldPosition);

      this.updateVoxel(); // set data coordinates && value

      this.updateDOM();
    }

    updateVoxel() {
      this._voxel.worldCoordinates = this._worldPosition;
      this._voxel.dataCoordinates = CoreUtils.worldToData(this._stack.lps2IJK, this._worldPosition);

      // update value
      let value = CoreUtils.getPixelData(this._stack, this._voxel.dataCoordinates);

      this._voxel.value =
        value === null || this._stack.numberOfChannels > 1
          ? 'NA' // coordinates outside the image or RGB
          : CoreUtils.rescaleSlopeIntercept(
            value,
            this._stack.rescaleSlope,
            this._stack.rescaleIntercept
          ).toFixed();
    }


    setlabeltext() {
      // called when the user creates a new arrow
      while (!this._labeltext) {
        this._labeltext = prompt('Please enter the annotation text', '');
      }
      this.displaylabel();
    }

    changelabeltext() {
      // called when the user does double click in the label
      this._labeltext = prompt('Please enter a new annotation text', this._labelTextBox.innerHTML);
      this.displaylabel();
    }

    displaylabel() {
      this._labelTextBox.innerHTML =
        typeof this._labeltext === 'string' && this._labeltext.length > 0 // avoid error
          ? this._labeltext
          : ''; // empty string is passed or Cancel is pressed
      // show the label (in css an empty string is used to revert display=none)
      this._label.style.display = '';
      this._dashline.style.display = '';
      this._label.style.transform = `translate3D(
        ${this._handle.screenPosition.x - this._labelOffset.x - this._label.offsetWidth / 2}px,
        ${this._handle.screenPosition.y -
          this._labelOffset.y -
          this._label.offsetHeight / 2 -
          this._container.offsetHeight}px, 0)`;
    }

    updateDOM() {
      // this.updateDOMColor();

      const transform = this.adjustLabelTransform(this._label, this._handle.screenPosition, true);

      this._label.style.transform = `translate3D(${transform.x}px, ${transform.y}px, 0)`;

      // update line
      const lineData = this.getLineData(
        this._handle.screenPosition,
        this._handle.screenPosition
      );

      // update label
      const paddingVector = lineData.line.multiplyScalar(0.5);
      const paddingPoint = this._handle.screenPosition.clone().sub(
        this._labelmoved
          ? this._labelOffset // if the label is moved, then its position is defined by labelOffset
          : paddingVector
      ); // otherwise it's placed in the center of the line
      const labelPosition = this.adjustLabelTransform(this._label, paddingPoint);

      this._label.style.transform = `translate3D(${labelPosition.x}px, ${labelPosition.y}px, 0)`;

      // create the label without the interaction of the user. Useful when we need to create the label manually
      if (this._manuallabeldisplay) {
        this.displaylabel();
      }

      // update dash line
      let minLine = this.getLineData(this._handle.screenPosition, paddingPoint);
      let lineCL = this.getLineData(lineData.center, paddingPoint);
      let line1L = this.getLineData(this._handle.screenPosition, paddingPoint);

      if (minLine.length > lineCL.length) {
        minLine = lineCL;
      }
      if (minLine.length > line1L.length) {
        minLine = line1L;
      }

      this._dashline.style.transform = `translate3D(${minLine.transformX}px, ${
        minLine.transformY
        }px, 0)
        rotate(${minLine.transformAngle}rad)`;
      this._dashline.style.width = minLine.length + 'px';


      // const rasContainer = this._label.querySelector('.lpsPosition');
      // const ijkContainer = this._label.querySelector('.ijkPosition');
      const valueContainer = this._label.querySelector('.value');

      // rasContainer.innerHTML = `LPS: 
      // ${this._voxel.worldCoordinates.x.toFixed(2)} :
      // ${this._voxel.worldCoordinates.y.toFixed(2)} :
      // ${this._voxel.worldCoordinates.z.toFixed(2)}`;
      // ijkContainer.innerHTML = `IJK: 
      // ${this._voxel.dataCoordinates.x} :
      // ${this._voxel.dataCoordinates.y} :
      // ${this._voxel.dataCoordinates.z}`;
      valueContainer.innerHTML = `Value: ${this._voxel.value}`;
      const labelValue = this._label.querySelector('.valueText');
      labelValue.innerHTML = `${this._labeltext}`;

        }

    updateDOMColor() {
      this._dashline.style.borderTop = '1.5px dashed ' + this._color;
      this._label.style.borderColor = this._color;
    }

    free() {
      this.removeEventListeners();

      // this._container.removeChild(this._line);

      this.remove(this._handle);
      this._handle.free();
      this._handle = null;
      this.remove(this._moveHandle);
      this._moveHandle.free();
      this._moveHandle = null;

      this._container.removeChild(this._label);
      this._container.removeChild(this._dashline);

      this._stack = null;
      this._voxel = null;

      super.free();
    }

    hideDOM() {
      this._dashline.style.display = 'none';
      this._label.style.display = 'none';
      this._handle.hideDOM();
    }

    showDOM() {
      this._dashline.style.display = '';
      this._label.style.display = '';
      this._handle.showDOM();
    }

    get targetMesh() {
      return this._targetMesh;
    }

    set targetMesh(targetMesh) {
      this._targetMesh = targetMesh;
      this._handle.targetMesh = targetMesh;
      this._moveHandle.targetMesh = targetMesh;
      this.update();
    }

    get worldPosition() {
      return this._worldPosition;
    }

    set worldPosition(worldPosition) {
      this._handle.worldPosition.copy(worldPosition);
      this._moveHandle.worldPosition.copy(worldPosition);
      this._worldPosition.copy(worldPosition);
      this.update();
    }

    get active() {
      return this._active;
    }

    set active(active) {
      this._active = active;
      this._controls.enabled = !this._active;

      this.update();
    }
  };
};

export { widgetsVoxelprobe };
export default widgetsVoxelprobe();
