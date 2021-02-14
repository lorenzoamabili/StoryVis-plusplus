import { ActionFunction, ActionFunctionRegistry } from '@visualstorytelling/provenance-core';
import { BrainvisCanvasComponent } from '../brainvis-canvas.component';
import { ComparisonComponent } from '../comparison.component';

const getActions = (canvas: BrainvisCanvasComponent | ComparisonComponent): { [key: string]: ActionFunction } => ({
  setSliceIndex: async (sliceOrientation, newIndex, oldIndex, transitionTime) => {
    canvas.changeSliceRemove(sliceOrientation, oldIndex);
    canvas.setSliceIndex(sliceOrientation, newIndex, transitionTime);
    canvas.changeSliceRender(sliceOrientation, newIndex);
  },

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
  deleteArtifact: async (view, artifact) => {
    canvas.deleteArtifact(view, artifact);
  },

  // setWindowLevel: async (valueW, valueC, slider) => {
  //   canvas.setWindowLevel(valueW, valueC, slider);
  // },

  setPerspectiveCameraZoomLevel: async (args, transitionTime) => canvas.setPerspectiveCameraZoom(args, transitionTime),
  setPerspectiveCameraOrientation: async (args, transitionTime) => canvas.setPerspectiveCameraOrientation(args, transitionTime),

  changeView: async (args) => {
    canvas.displayOneView(args);
  },
  
  changeSlicesLocation: async (parameters) => {
    canvas.changeSlicesLocation(parameters);
  },

  resetSlicesLocation: async () => {
    canvas.resetSlicesLocation();
  },

  resetConfig: async () => {
    canvas.resetConfig();
  },  
  setConfig: async (parameters) => {
    canvas.setConfig(parameters);
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