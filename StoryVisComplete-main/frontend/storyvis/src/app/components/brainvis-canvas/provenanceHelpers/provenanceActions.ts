import { ActionFunction, ActionFunctionRegistry } from '@visualstorytelling/provenance-core';
import { BrainvisCanvasComponent } from '../brainvis-canvas.component';
import { ComparisonComponent } from '../comparison.component';

const getActions = (canvas: BrainvisCanvasComponent | ComparisonComponent): { [key: string]: ActionFunction } => ({
  setSliceIndex: async (sliceOrientation, newIndex, oldIndex, transitionTime) => {
    canvas.changeSliceRemove(sliceOrientation, oldIndex);
    canvas.setSliceIndex(newIndex, transitionTime, sliceOrientation);
    canvas.changeSliceRender(sliceOrientation, newIndex);
  },
  // setMultipleSliceIndex: async (sliceOrientation, newIndex, oldIndex, domID) => {
  //   canvas.changeSliceRemove(sliceOrientation, oldIndex);
  //   canvas.setMultipleSliceIndex(newIndex, domID);
  //   canvas.changeSliceRender(sliceOrientation, newIndex);
  // },

  setSliceDrag: async (slicePosition, sliceOrientation, transitionTime) => {
    canvas.setSliceDrag(slicePosition, sliceOrientation, transitionTime);
  },
  setSliceZoom: async (zoom, sliceOrientation, transitionTime) => {
    canvas.setSliceZoom(zoom, sliceOrientation, transitionTime);
  },
  renderArtifact: async (view, artifact) => {
    canvas.renderArtifact(view, artifact);
  },
  removeArtifact: async (view, artifact) => {
    canvas.removeArtifact(view, artifact);
  },
  setWindowLevel: async (valueW, valueC, slider) => {
    canvas.setWindowLevel(valueW, valueC, slider);
  },
  navigateVolume: async (sliceOrientation, index) => {
    canvas.navigateVolume(sliceOrientation, index, 10000);
  },

  setPerspectiveCameraZoomLevel: async (args, transitionTime) => canvas.setPerspectiveCameraZoom(args, transitionTime),
  setPerspectiveCameraOrientation: async (args, transitionTime) => canvas.setPerspectiveCameraOrientation(args, transitionTime),

  changeView: async (args) => {
    canvas.displayOneView(args);
  },
  multiplePlanes: async (args) => {
    canvas.multiplePlanes(args);
  },
  setConfig: async (parameters) => {
    canvas.setConfig(parameters);
  },
  resetConfig: async () => {
    canvas.resetConfig();
  },
  renderMeasurements: async (parameters) => {
    canvas.renderMeasurements(parameters);
  },  
  removeMeasurements: async (parameters) => {
    canvas.removeMeasurements(parameters);
  },
  null: async () => {
  }
});


export const registerActions = (registry: ActionFunctionRegistry, canvas: BrainvisCanvasComponent | ComparisonComponent): any => {
  const actions = getActions(canvas);

  Object.keys(actions).forEach(actionName => {
    registry.register(actionName, actions[actionName]);
  });
};