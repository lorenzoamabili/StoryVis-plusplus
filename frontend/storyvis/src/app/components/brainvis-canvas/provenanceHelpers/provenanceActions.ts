import { ActionFunction, ActionFunctionRegistry } from '@visualstorytelling/provenance-core';
import { BrainvisCanvasComponent, VIEWS } from '../brainvis-canvas.component';
import { Renderer2D } from '../renderer2d';
import * as THREE from 'three';
import { IPointPair, IPointAngle } from '../utils/types';

const getActions = (canvas: BrainvisCanvasComponent): { [key: string]: ActionFunction } => ({
  // setControlZoom: (args, transitionTime) => Promise.resolve(canvas.setControlZoom(args, transitionTime)),
  // setControlOrientation: (args, transitionTime) => Promise.resolve(canvas.setControlOrientation(args, transitionTime)),
  setSlicePlaneOrientation: async (position, direction, transitionTime) =>
    canvas.setSlicePlanePosition({ position, direction }, transitionTime),
  setSlicePlaneZoom: async (position, direction, transitionTime) =>
    canvas.setSlicePlaneZoom({ position, direction }, transitionTime),
  setAxialZoom: async (position, direction, transitionTime) =>
    canvas.setAxialZoom({ position, direction }, transitionTime),
  setSagittalZoom: async (position, direction, transitionTime) =>
    canvas.setSagittalZoom({ position, direction }, transitionTime),
  setCoronalZoom: async (position, direction, transitionTime) =>
    canvas.setCoronalZoom({ position, direction }, transitionTime),
  setSliceIndex: async (sliceOrientation, newIndex, oldIndexArt, newIndexArt) => 
  { 
    canvas.changeSliceRemove(sliceOrientation, oldIndexArt);
    canvas.setSliceIndex(sliceOrientation, newIndex);
    canvas.changeSliceRender(sliceOrientation, newIndexArt);
  },
  setWindowLevelC: async (value) => {
    canvas._thresholdValueSetManually = false,
    canvas.setWindowLevelC(value)
    },
  setWindowLevelW: async (value) => { 
    canvas._thresholdValueSetManually = false,
    canvas.setWindowLevelW(value)
  },

  setPerspectiveCameraZoomLevel: async (args, transitionTime) => canvas.setPerspectiveCameraZoom(args, transitionTime),
  setPerspectiveCameraOrientation: async (args, transitionTime) => canvas.setPerspectiveCameraOrientation(args, transitionTime),

  // createRuler: async (view, { p0, p1 }: IPointPair) => {
  //   const renderer = canvas.getRenderer(view);
  //   if (renderer instanceof Renderer2D) {
  //     renderer.createRuler({ p0, p1 });
  //   }
  // },
  // deleteRuler: async (view) => {
  //   const renderer = canvas.getRenderer(view);
  //   if (renderer instanceof Renderer2D) {
  //     renderer.deleteRuler();
  //   }
  // },

  removeArtifact: async (view, artifact) => {
      canvas.removeArtifact(view, artifact);
  },
  renderArtifact: async (view, artifact) => {
    canvas.renderArtifact(view, artifact);
}
});

export const registerActions = (registry: ActionFunctionRegistry, canvas: BrainvisCanvasComponent) => {
  const actions = getActions(canvas);

  Object.keys(actions).forEach(actionName => {
    registry.register(actionName, actions[actionName]);
  });
};
