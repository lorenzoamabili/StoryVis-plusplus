import { widgetsBase } from './widgets.base';
import { widgetsHandle as widgetsHandleFactory } from './widgets.handle';

/**
 * @module widgets/ruler
 */
const widgetsRuler = (three = window.THREE) => {
  if (three === undefined || three.Object3D === undefined) {
    return null;
  }

  const Constructor = widgetsBase(three);
  return class extends Constructor {
    constructor(targetMesh, controls, params = {}) {
      super(targetMesh, controls, params);

      this._widgetType = 'Ruler';

      // incoming parameters (optional: lps2IJK, pixelSpacing, ultrasoundRegions, worldPosition)
      this._calibrationFactor = params.calibrationFactor || null;

      // outgoing values
      this._distance = null;
      this._units = !this._calibrationFactor && !params.pixelSpacing ? 'units' : 'mm';

      this._container.style.cursor = 'pointer';
      this._moving = false;
      this._domHovered = false;
      this._initialized = false; // set to true when the name of the label is entered
      this._movinglabel = null; // bool that turns true when the label is moving with the mouse
      this._labelmoved = false; // bool that turns true once the label is moved by the user (at least once)
      this._labelhovered = false;
      this._manuallabeldisplay = false; // Make true to force the label to be displayed
      this._labeltext = null;
      this._labelOffset = new three.Vector3(); // difference between label center and second handle
      this._mouseLabelOffset = new three.Vector3(); // difference between mouse coordinates and label center

      // mesh stuff
      this._material = null;
      this._geometry = null;
      this._mesh = null;

      // dom stuff
      this._dashline = null;
      this._line = null;
      this._label = null;

      // add handles
      this._handles = [];
      const WidgetsHandle = widgetsHandleFactory(three);

      let handle;
      for (let i = 0; i < 2; i++) {
        handle = new WidgetsHandle(targetMesh, controls, params);
        this.add(handle);
        this._handles.push(handle);
      }
      this._handles[1].active = true;
      this._handles[1].tracking = true;

      this._moveHandle = new WidgetsHandle(targetMesh, controls, params);
      this.add(this._moveHandle);
      this._handles.push(this._moveHandle);
      this._moveHandle.hide();

      this.create();
      this.initOffsets();

      this.onMove = this.onMove.bind(this);
      this.onHover = this.onHover.bind(this);
      this.onHoverlabel = this.onHoverlabel.bind(this);
      this.notonHoverlabel = this.notonHoverlabel.bind(this);
      this.addEventListeners();
    }

    addEventListeners() {
      this._container.addEventListener('wheel', this.onMove);

      this._line.addEventListener('mouseenter', this.onHover);
      this._line.addEventListener('mouseleave', this.onHover);
      this._label.addEventListener('mouseenter', this.onHoverlabel);
      this._label.addEventListener('mouseleave', this.notonHoverlabel);
    }

    removeEventListeners() {
      this._container.removeEventListener('wheel', this.onMove);

      this._line.removeEventListener('mouseenter', this.onHover);
      this._line.removeEventListener('mouseleave', this.onHover);
      this._label.removeEventListener('mouseenter', this.onHoverlabel);
      this._label.removeEventListener('mouseleave', this.notonHoverlabel);
    }


    onHover(evt) {
      if (evt) {
        this.hoverDom(evt);
      }

      this.hoverMesh();

      this._hovered = this._handles[0].hovered || this._handles[1].hovered || this._domHovered;
      this._container.style.cursor = this._hovered ? 'pointer' : 'default';
    }

    hoverMesh() {
      // check raycast intersection, do we want to hover on mesh or just css?
    }

    hoverDom(evt) {
      this._domHovered = evt.type === 'mouseenter';
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
        const paddingPoint = this._handles[1].screenPosition.clone().sub(this._labelOffset);

        this._mouseLabelOffset = new three.Vector3(
          offsets.screenX - paddingPoint.x,
          offsets.screenY - paddingPoint.y,
          0
        );
        this._movinglabel = true;
        this._labelmoved = true;
      }

      this._moveHandle.onMove(evt, true);

      this._handles[0].onStart(evt);
      this._handles[1].onStart(evt);

      this._active = this._handles[0].active || this._handles[1].active || this._domHovered;

      if (this._domHovered && !this._handles[1].tracking) {
        this._moving = true;
        this._controls.enabled = false;
      }

      this.update();
    }

    onMove(evt) {
      if (this._movinglabel) {
        const offsets = this.getMouseOffsets(evt, this._container);

        this._labelOffset = new three.Vector3(
          this._handles[1].screenPosition.x - offsets.screenX + this._mouseLabelOffset.x,
          this._handles[1].screenPosition.y - offsets.screenY + this._mouseLabelOffset.y,
          0
        );
        this._controls.enabled = false;
      }

      if (this._active) {
        const prevPosition = this._moveHandle.worldPosition.clone();

        this._dragged = true;
        this._moveHandle.onMove(evt, true);
        this._hovered = this._handles[0].active || this._handles[1].active || this._labelhovered;

        if (this._moving) {
          this._handles.slice(0, -1).forEach(handle => {
            handle.worldPosition.add(this._moveHandle.worldPosition.clone().sub(prevPosition));
          });
        }
      } else {
        this.onHover(null);
      }

      this._handles[0].onMove(evt);
      this._handles[1].onMove(evt);

      this.update();
    }

    onEnd() {
      this._handles[0].onEnd(); // First Handle

      if (
        this._handles[1].tracking &&
        this._handles[0].screenPosition.distanceTo(this._handles[1].screenPosition) < 10
      ) {
        return;
      }

      if (!this._dragged && this._active && !this._handles[1].tracking) {
        this._selected = !this._selected; // change state if there was no dragging
        this._handles[0].selected = this._selected;
      }

      // Second Handle
      if (this._dragged || !this._handles[1].tracking) {
        this._handles[1].tracking = false;
        this._handles[1].onEnd();
      } else {
        this._handles[1].tracking = false;
      }
      this._handles[1].selected = this._selected;

      this._active = this._handles[0].active || this._handles[1].active;
      this._initialized = true;
      this._dragged = false;
      this._movinglabel = false;
      this._moving = false;

      this.update();
    }

    create() {
      this.createMesh();
      this.createDOM();
    }

    createMesh() {
      // geometry
      this._geometry = new three.Geometry();
      this._geometry.vertices.push(this._handles[0].worldPosition);
      this._geometry.vertices.push(this._handles[1].worldPosition);

      // material
      this._material = new three.LineBasicMaterial();

      this.updateMeshColor();

      // mesh
      this._mesh = new three.Line(this._geometry, this._material);
      this._mesh.visible = true;

      this.add(this._mesh);
    }

    createDOM() {
      this._dashline = document.createElement('div');
      this._dashline.className = 'widgets-dashline';
      this._container.appendChild(this._dashline);

      this._line = document.createElement('div');
      this._line.className = 'widgets-line';
      this._container.appendChild(this._line);

      this._label = document.createElement('div');
      this._label.className = 'widgets-label';
      this._container.appendChild(this._label);

      this.updateDOMColor();
    }

    hideDOM() {
      this._line.style.display = 'none';
      this._label.style.display = 'none';
      this._handles.forEach(elem => elem.hideDOM());
    }

    showDOM() {
      this._line.style.display = '';
      this._label.style.display = '';
      this._handles[0].showDOM();
      this._handles[1].showDOM();
    }

    update() {
      this.updateColor();

      this._handles[0].update();
      this._handles[1].update();

      // calculate values
      const distanceData = this.getDistanceData(
        this._handles[0].worldPosition,
        this._handles[1].worldPosition,
        this._calibrationFactor
      );

      this._distance = distanceData.distance;
      if (distanceData.units) {
        this._units = distanceData.units;
      }

      this.updateMeshColor();
      this.updateMeshPosition();

      this.updateDOM();
    }

    updateMeshColor() {
      if (this._material) {
        this._material.color.set(this._color);
      }
    }

    updateMeshPosition() {
      if (this._geometry) {
        this._geometry.verticesNeedUpdate = true;
      }
    }

    updateDOM() {
      // this.updateDOMColor();

      const transform = this.adjustLabelTransform(this._label, this._handles[1].screenPosition, true);

      this._label.style.transform = `translate3D(${transform.x}px, ${transform.y}px, 0)`;

      // update line
      const lineData = this.getLineData(
        this._handles[0].screenPosition,
        this._handles[1].screenPosition
      );

      this._line.style.transform = `translate3D(${lineData.transformX}px, ${
        lineData.transformY
        }px, 0)
      rotate(${lineData.transformAngle}rad)`;
      this._line.style.width = lineData.length + 'px';



      if (this._units === 'units' && !this._label.hasAttribute('title')) {
        this._label.setAttribute('title', 'Calibration is required to display the distance in mm');
        this._label.style.color = this._colors.error;
      } else if (this._units !== 'units' && this._label.hasAttribute('title')) {
        this._label.removeAttribute('title');
        this._label.style.color = this._colors.text;
      }
      this._label.innerHTML = `${this._distance.toFixed(2)} ${this._units}`;

      let angle = Math.abs(lineData.transformAngle);
      if (angle > Math.PI / 2) {
        angle = Math.PI - angle;
      }

      // const labelPadding =
      //   Math.tan(angle) < this._label.offsetHeight / this._label.offsetWidth
      //     ? this._label.offsetWidth / 2 / Math.cos(angle) + 15 // 5px for each handle + padding
      //     : this._label.offsetHeight / 2 / Math.cos(Math.PI / 2 - angle) + 15;
      // const paddingVector = lineData.line.normalize().multiplyScalar(labelPadding);
      // const paddingPoint =
      //   lineData.length > labelPadding * 2
      //     ? this._handles[1].screenPosition.clone().sub(paddingVector)
      //     : this._handles[1].screenPosition.clone().add(paddingVector);

      // update label
      const paddingVector = lineData.line.multiplyScalar(0.5);
      const paddingPoint = this._handles[1].screenPosition.clone().sub(
        this._labelmoved
          ? this._labelOffset // if the label is moved, then its position is defined by labelOffset
          : paddingVector
      ); // otherwise it's placed in the center of the line
      const labelPosition = this.adjustLabelTransform(this._label, paddingPoint);

      this._label.style.transform = `translate3D(${labelPosition.x}px, ${labelPosition.y}px, 0)`;

      if (this._manuallabeldisplay) {
        this.displaylabel();
      }

      // update dash line
      let minLine = this.getLineData(this._handles[1].screenPosition, paddingPoint);
      let line0L = this.getLineData(this._handles[0].screenPosition, paddingPoint);
      let line1L = this.getLineData(this._handles[1].screenPosition, paddingPoint);

      if (minLine.length > line0L.length) {
        minLine = line0L;
      }
      if (minLine.length > line1L.length) {
        minLine = line1L;
      }

      this._dashline.style.transform = `translate3D(${minLine.transformX}px, ${
        minLine.transformY
        }px, 0)
        rotate(${minLine.transformAngle}rad)`;
      this._dashline.style.width = minLine.length + 'px';
    }

    updateDOMColor() {
      this._line.style.backgroundColor = this._color;
      this._label.style.borderColor = this._color;
      this._dashline.style.borderTop = '1.5px dashed ' + this._color;
    }

    displaylabel() {
      this._label.innerHTML =
        typeof this._labeltext === 'string' && this._labeltext.length > 0 // avoid error
          ? this._labeltext
          : ''; // empty string is passed or Cancel is pressed
      // show the label (in css an empty string is used to revert display=none)
      this._label.style.display = '';
      this._dashline.style.display = '';
      this._label.style.transform = `translate3D(
        ${this._handles[1].screenPosition.x - this._labelOffset.x - this._label.offsetWidth / 2}px,
        ${this._handles[1].screenPosition.y -
        this._labelOffset.y -
        this._label.offsetHeight / 2 -
        this._container.offsetHeight}px, 0)`;
    }


    free() {
      this.removeEventListeners();

      this._handles.forEach(h => {
        this.remove(h);
        h.free();
      });
      this._handles = [];

      this._container.removeChild(this._line);
      this._container.removeChild(this._label);
      this._container.removeChild(this._dashline);

      // mesh, geometry, material
      this.remove(this._mesh);
      this._mesh.geometry.dispose();
      this._mesh.geometry = null;
      this._mesh.material.dispose();
      this._mesh.material = null;
      this._mesh = null;
      this._geometry.dispose();
      this._geometry = null;
      this._material.vertexShader = null;
      this._material.fragmentShader = null;
      this._material.uniforms = null;
      this._material.dispose();
      this._material = null;

      super.free();
    }

    hideDOM() {
      this._dashline.style.display = 'none';
      this._label.style.display = 'none';
      this._handles[0].hideDOM();
      this._handles[1].hideDOM();
      this._container.removeChild(this._line);
    }

    showDOM() {
      this._dashline.style.display = '';
      this._label.style.display = '';
      this._handles[0].showDOM();
      this._handles[1].showDOM();
      this._container.appendChild(this._line);
    }

    getMeasurements() {
      return {
        distance: this._distance,
        units: this._units,
      };
    }

    get targetMesh() {
      return this._targetMesh;
    }

    set targetMesh(targetMesh) {
      this._targetMesh = targetMesh;
      this._handles.forEach(elem => (elem.targetMesh = targetMesh));
      this.update();
    }

    get worldPosition() {
      return this._worldPosition;
    }

    set worldPosition(worldPosition) {
      this._handles[0].worldPosition.copy(worldPosition);
      this._handles[1].worldPosition.copy(worldPosition);
      this._worldPosition.copy(worldPosition);
      this.update();
    }

    get calibrationFactor() {
      return this._calibrationFactor;
    }

    set calibrationFactor(calibrationFactor) {
      this._calibrationFactor = calibrationFactor;
      this._units = 'mm';
      this.update();
    }
  };
};

export { widgetsRuler };
export default widgetsRuler();
