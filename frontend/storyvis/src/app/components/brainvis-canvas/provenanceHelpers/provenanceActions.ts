import { ActionFunction, ActionFunctionRegistry } from '@visualstorytelling/provenance-core';
import { BrainvisCanvasComponent } from '../brainvis-canvas.component';

const getActions = (canvas: BrainvisCanvasComponent): { [key: string]: ActionFunction } => ({
  setSliceIndex: async (sliceOrientation, newIndex, oldIndex) => {
    canvas.changeSliceRemove(sliceOrientation, oldIndex);
    canvas.setSliceIndex(sliceOrientation, newIndex);
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

  setWindowLevel: async (valueW, valueC, slider) => {
    canvas.setWindowLevel(valueW, valueC, slider);
  },
  setPerspectiveCameraZoomLevel: async (args, transitionTime) => canvas.setPerspectiveCameraZoom(args, transitionTime),
  setPerspectiveCameraOrientation: async (args, transitionTime) => canvas.setPerspectiveCameraOrientation(args, transitionTime),

  magnifyView: async (domID) => {
    canvas.createOneView(domID);
  },
  reduceView: async (domID) => {
    canvas.create4Views(domID);
  }
});

export const registerActions = (registry: ActionFunctionRegistry, canvas: BrainvisCanvasComponent) => {
  const actions = getActions(canvas);

  Object.keys(actions).forEach(actionName => {
    registry.register(actionName, actions[actionName]);
  });
};
