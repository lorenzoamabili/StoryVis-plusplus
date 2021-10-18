import { widgetsBase } from './widgets.base';
import { widgetsHandle as widgetsHandleFactory } from './widgets.handle';

/**
 * @module widgets/annotation
 * @todo: add option to show only label (without mesh, dots and lines)
 */
const widgetsAnnotation = (three = window.THREE) => {
  if (three === undefined || three.Object3D === undefined) {
    return null;
  }

  const Constructor = widgetsBase(three);
  return class extends Constructor {
    constructor(targetMesh, controls, params = {}) {
      super(targetMesh, controls, params);

      this._widgetType = 'Annotation';

      // incoming parameters (optional: worldPosition)

      this._initialized = false; // set to true when the name of the label is entered
      this._movinglabel = null; // bool that turns true when the label is moving with the mouse
      this._labelmoved = false; // bool that turns true once the label is moved by the user (at least once)
      this._labelhovered = false;
      this._manuallabeldisplay = false; // Make true to force the label to be displayed

      // mesh stuff
      this._material = null;
      this._geometry = null;
      this._meshline = null;
      this._cone = null;

      // dom stuff
      this._handle = null;
      this._dashline = null;
      this._label = null;
      this._labeltext = null;

      // var
      this._labelOffset = new three.Vector3(); // difference between label center and second handle
      this._mouseLabelOffset = new three.Vector3(); // difference between mouse coordinates and label center

      const WidgetsHandle = widgetsHandleFactory(three);
      this._handle = new WidgetsHandle(targetMesh, controls, params);
      this.add(this._handle);

      // this._moveHandle = new WidgetsHandle(targetMesh, controls, params);
      // this.add(this._moveHandle);
      // this._moveHandle.hide();

      this._handle.active = true;

      this.create();
      this.initOffsets();

      this.onResize = this.onResize.bind(this);
      this.onMove = this.onMove.bind(this);
      this.onHoverlabel = this.onHoverlabel.bind(this);
      this.notonHoverlabel = this.notonHoverlabel.bind(this);
      this.changelabeltext = this.changelabeltext.bind(this);

      this.addEventListeners();
    }

    addEventListeners() {
      window.addEventListener('resize', this.onResize);

      this._label.addEventListener('mouseenter', this.onHoverlabel);
      this._label.addEventListener('mouseleave', this.notonHoverlabel);
      this._label.addEventListener('contextmenu', this.changelabeltext);

      this._container.addEventListener('wheel', this.onMove);
    }

    removeEventListeners() {
      window.removeEventListener('resize', this.onResize);

      this._label.removeEventListener('mouseenter', this.onHoverlabel);
      this._label.removeEventListener('mouseleave', this.notonHoverlabel);
      this._label.removeEventListener('contextmenu', this.changelabeltext);

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

      // this._handle.onStart(evt);
      // this._moveHandle.onMove(evt, true);
      this._handle.onStart(evt);

      this._active = this._handle.active || this._domHovered;
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
        this._dragged = true;
      }

      // this._handle.onMove(evt);
      this._handle.onMove(evt);

      this._hovered =
        // this._handle.hovered || 
        this._handle.hovered || this._labelhovered;

      this.update();
    }

    onEnd() {
      this._handle.onEnd(); // First Handle

      // Second Handle
      if (this._dragged || !this._handle.tracking) {
        this._handle.tracking = false;
        this._handle.onEnd();
      } else {
        this._handle.tracking = false;
      }

      if (!this._dragged && this._active && this._initialized) {
        this._selected = !this._selected; // change state if there was no dragging
        this._handle.selected = this._selected;
      }

      if (!this._initialized) {
        // this._labelOffset = this._handle.screenPosition
        //   .clone()
        //   .multiplyScalar(0.5);
        this.setlabeltext();
        this._initialized = true;
      }

      this._active = this._handle.active;
      this._dragged = false;
      this._movinglabel = false;
      this.update();
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
      this._labeltext = prompt('Please enter a new annotation text', this._label.innerHTML);
      this.displaylabel();
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
        ${this._handle.screenPosition.x - this._labelOffset.x - this._label.offsetWidth / 2}px,
        ${this._handle.screenPosition.y -
        this._labelOffset.y -
        this._label.offsetHeight / 2 -
        this._container.offsetHeight}px, 0)`;
    }

    createMesh() {
      // material
      this._material = new three.LineBasicMaterial();

      this.updateMeshColor();

      // line geometry
      this._geometry = new three.Geometry();
      this._geometry.vertices.push(this._handle.worldPosition);
      this._geometry.vertices.push(this._handle.worldPosition);

      // line mesh
      this._meshline = new three.Line(this._geometry, this._material);
      this._meshline.visible = true;

      this.add(this._meshline);

      // cone geometry
      this._conegeometry = new three.CylinderGeometry(0, 2, 10);
      this._conegeometry.translate(0, -5, 0);
      this._conegeometry.rotateX(-Math.PI / 2);

      // cone mesh
      this._cone = new three.Mesh(this._conegeometry, this._material);
      this._cone.visible = true;

      this.add(this._cone);
    }

    create() {
      this.createMesh();
      this.createDOM();
    }

    createDOM() {
      this._dashline = document.createElement('div');
      this._dashline.className = 'widgets-dashline';
      this._dashline.style.display = 'none';
      this._container.appendChild(this._dashline);

      this._label = document.createElement('div');
      this._label.className = 'widgets-label';
      this._label.style.display = 'none';
      this._container.appendChild(this._label);

      this.updateDOMColor();
    }

    update() {
      this.updateColor();

      this._handle.update();
      // this._worldPosition.copy(this._handle.worldPosition);
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

      if (this._cone) {
        this._cone.position.copy(this._handle.worldPosition);
        this._cone.lookAt(this._handle.worldPosition);
      }
    }


    updateDOM() {
      // this.updateDOMColor();
      // update line
      const lineData = this.getLineData(
        this._handle.screenPosition,
        this._handle.screenPosition
      );

      const transform = this.adjustLabelTransform(this._label, this._handle.screenPosition, true);

      this._label.style.transform = `translate3D(${transform.x}px, ${transform.y}px, 0)`;

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
    }

    updateDOMColor() {
      // this._line.style.backgroundColor = this._color;
      this._dashline.style.borderTop = '1.5px dashed ' + this._color;
      this._label.style.borderColor = this._color;
    }

    hideDOM() {
      // this._line.style.display = 'none';
      this._dashline.style.display = 'none';
      this._label.style.display = 'none';
      this._handle.hideDOM();
    }

    showDOM() {
      // this._line.style.display = '';
      this._dashline.style.display = '';
      this._label.style.display = '';
      this._handle.showDOM();
    }

    endAll() {
      this._handle.onEnd();
      this._dragged = false;
      this._movinglabel = false;
      this._moving = false;

      this.update();
    }

    free() {
      this.removeEventListeners();
      this.remove(this._handle);
      this._handle.free();

      // this._container.removeChild(this._line);
      this._container.removeChild(this._handle);
      this._container.removeChild(this._dashline);
      this._container.removeChild(this._label);

      // mesh, geometry, material
      this.remove(this._meshline);
      this._meshline.geometry.dispose();
      this._meshline.geometry = null;
      this._meshline.material.dispose();
      this._meshline.material = null;
      this._meshline = null;
      this._geometry.dispose();
      this._geometry = null;
      this._material.vertexShader = null;
      this._material.fragmentShader = null;
      this._material.uniforms = null;
      this._material.dispose();
      this._material = null;
      this.remove(this._cone);
      this._cone.geometry.dispose();
      this._cone.geometry = null;
      this._cone.material.dispose();
      this._cone.material = null;
      this._cone = null;
      this._conegeometry.dispose();
      this._conegeometry = null;
      super.free();
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
      this._handle.worldPosition.copy(worldPosition);
      this._worldPosition.copy(worldPosition);
      this.update();
    }
  };
};

export { widgetsAnnotation };
export default widgetsAnnotation();
