/** * Imports ***/
import coreIntersections from '../core/core.intersections';
import coreUtils from '../core/core.utils';

/**
 *
 * It is typically used for creating an irregular 3D planar shape given a box and the cut-plane.
 *
 * Demo: {@link https://fnndsc.github.io/vjs#geometry_slice}
 *
 * @module geometries/slice
 *
 * @param {Vector3} halfDimensions - Half-dimensions of the box to be sliced.
 * @param {Vector3} center - Center of the box to be sliced.
 * @param {Vector3<Vector3>} orientation - Orientation of the box to be sliced. (might not be necessary..?)
 * @param {Vector3} position - Position of the cutting plane.
 * @param {Vector3} direction - Cross direction of the cutting plane.
 *
 * @example
 * // Define box to be sliced
 * let halfDimensions = new THREE.Vector(123, 45, 67);
 * let center = new Vector3(0, 0, 0);
 * let orientation = new Vector3(
 *   new Vector3(1, 0, 0),
 *   new Vector3(0, 1, 0),
 *   new Vector3(0, 0, 1)
 * );
 *
 * // Define slice plane
 * let position = center.clone();
 * let direction = new Vector3(-0.2, 0.5, 0.3);
 *
 * // Create the slice geometry & materials
 * let sliceGeometry = new VJS.geometries.slice(halfDimensions, center, orientation, position, direction);
 * let sliceMaterial = new THREE.MeshBasicMaterial({
 *   'side': THREE.DoubleSide,
 *   'color': 0xFF5722
 * });
 *
 *  // Create mesh and add it to the scene
 *  let slice = new THREE.Mesh(sliceGeometry, sliceMaterial);
 *  scene.add(slice);
 */

const geometriesSlice = (three = window.THREE) => {
  if (three === undefined || three.ShapeBufferGeometry === undefined) {
    return null;
  }

  const Constructor = three.ShapeBufferGeometry;
  return class extends Constructor {
    constructor(halfDimensions, center, position, direction, toAABB = new three.Matrix4()) {
      //
      // prepare data for the shape!
      //
      let aabb = {
        halfDimensions,
        center,
        toAABB
      };

      let plane = {
        position,
        direction
      };

      // BOOM!  workaround applied
      let intersections = null;
      let safeIntersections = null;
      let oldaabb = null;
      let oldPlane = null;

      for (let i = 0; i < 2; i++) {
        oldaabb = [
          { x: 191.5, y: 255.5, z: 27.5, isVector3: true },
          {x: 192, y: 256, z: 28},
          {elements: Array(16), isMatrix4: true}
        ];
        oldPlane = [
          {x: 0, y: 0, z: 1, isVector3: true},
          {x: 192, y: 256, z: 28, isVector3: true}
        ];
        intersections = coreIntersections.aabbPlane(aabb, plane);
        safeIntersections = intersections.length < 3 ? coreIntersections.aabbPlane(oldaabb, oldPlane) : intersections;
      }

      // can not exist before calling the constructor
      if (safeIntersections.length < 3) {
        window.console.log('WARNING: Less than 3 intersections between AABB and Plane.');
        window.console.log('AABB');
        window.console.log(aabb);
        window.console.log('Plane');
        window.console.log(plane);
        window.console.log('exiting...');
        const err = new Error(
          'geometries.slice has less than 3 intersections, can not create a valid geometry.'
        );
        throw err;
      }

      let points = safeIntersections.length < 3 ?
        [{ x: -0.5, y: -0.5, z: 28 },
        { x: 383.5, y: 511.5, z: 28 },
        { x: 383.5, y: -0.5, z: 28 },
        { x: -0.5, y: 511.5, z: 28 }]
        : coreUtils.orderIntersections(safeIntersections, direction);

        
      // create the shape
      let shape = new three.Shape();
      // move to first point!
      shape.moveTo(points[0].xy.x, points[0].xy.y);

      // loop through all points!
      const positions = new Float32Array(points.length * 3);
      positions.set(points[0].toArray(), 0);

      for (let i = 1; i < points.length; i++) {
        // project each on plane!
        positions.set(points[i].toArray(), i * 3);

        shape.lineTo(points[i].xy.x, points[i].xy.y);
      }

      // close the shape!
      shape.lineTo(points[0].xy.x, points[0].xy.y);

      //
      // Generate Slice Buffer Geometry from Shape Buffer Geomtry
      // bewcause it does triangulation for us!
      super(shape);
      this.type = 'SliceBufferGeometry';

      // update real position of each vertex! (not in 2d)
      this.setAttribute('position', new three.Float32BufferAttribute(positions, 3));
      this.vertices = points; // legacy code to compute normals int he SliceHelper
      postMessage(positions, '*', [positions.buffer]);
    }
  };
};

// export factory
export { geometriesSlice };
// default export to
export default geometriesSlice();
