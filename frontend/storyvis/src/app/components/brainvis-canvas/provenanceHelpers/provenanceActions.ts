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
    
  setSliceIndex: async (sliceOrientation, index) => canvas.setSliceIndex(sliceOrientation, index),
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

  addRuler: async (view, ruler) => {
    const renderer = canvas.getRenderer(view);
    if (renderer instanceof Renderer2D) {
      renderer.addRuler(ruler);
    }
  },
  removeRuler: async (view, ruler) => {
    const renderer = canvas.getRenderer(view);
    if (renderer instanceof Renderer2D) {
      renderer.removeRuler(ruler);
    }
  },
  // updateRuler: async (view, points: IPointPair) => {
  //   const renderer = canvas.getRenderer(view);
  //   if (renderer instanceof Renderer2D) {
  //     renderer.updateRuler(points);
  //   }
  // },


  addAngle: async (view, angle) => {
    const renderer = canvas.getRenderer(view);
    if (renderer instanceof Renderer2D) {
      renderer.addAngle(angle);
    }
  },
  removeAngle: async (view, angle) => {
    const renderer = canvas.getRenderer(view);
    if (renderer instanceof Renderer2D) {
      renderer.removeAngle(angle);
    }
  },
  addFreehand: async (view, freehand) => {
    const renderer = canvas.getRenderer(view);
    if (renderer instanceof Renderer2D) {
      renderer.addFreehand(freehand);
    }
  },
  removeFreehand: async (view, freehand) => {
    const renderer = canvas.getRenderer(view);
    if (renderer instanceof Renderer2D) {
      renderer.removeFreehand(freehand);
    }
  },
  addVoxelprobe: async (view, voxelprobe) => {
    const renderer = canvas.getRenderer(view);
    if (renderer instanceof Renderer2D) {
      renderer.addVoxelprobe(voxelprobe);
    }
  },
  removeVoxelprobe: async (view, voxelprobe) => {
    const renderer = canvas.getRenderer(view);
    if (renderer instanceof Renderer2D) {
      renderer.removeVoxelprobe(voxelprobe);
    }
  },
  addAnnotation: async (view, annotation) => {
    const renderer = canvas.getRenderer(view);
    if (renderer instanceof Renderer2D) {
      renderer.addAnnotation(annotation);
    }
  },
  removeAnnotation: async (view, annotation) => {
    const renderer = canvas.getRenderer(view);
    if (renderer instanceof Renderer2D) {
      renderer.removeAnnotation(annotation);
    }
  }







  // createAngle: async (view, { p0, p1, p2 }: IPointAngle) => {
  //   const renderer = canvas.getRenderer(view);
  //   if (renderer instanceof Renderer2D) {
  //     renderer.createAngle({ p0, p1, p2 });
  //   }
  // },
  // deleteAngle: async (view) => {
  //   const renderer = canvas.getRenderer(view);
  //   if (renderer instanceof Renderer2D) {
  //     renderer.deleteAngle();
  //   }
  // },
  // createFreehand: async (view, { p0, p1 }: IPointPair) => {
  //   const renderer = canvas.getRenderer(view);
  //   if (renderer instanceof Renderer2D) {
  //     renderer.createFreehand({ p0, p1 });
  //   }
  // },
  // deleteFreehand: async (view) => {
  //   const renderer = canvas.getRenderer(view);
  //   if (renderer instanceof Renderer2D) {
  //     renderer.deleteFreehand();
  //   }
  // },
  // createVoxelprobe: async (view, { p0, p1 }: IPointPair) => {
  //   const renderer = canvas.getRenderer(view);
  //   if (renderer instanceof Renderer2D) {
  //     renderer.createVoxelprobe({ p0, p1 });
  //   }
  // },
  // deleteVoxelprobe: async (view) => {
  //   const renderer = canvas.getRenderer(view);
  //   if (renderer instanceof Renderer2D) {
  //     renderer.deleteVoxelprobe();
  //   }
  // },
  // createAnnotation: async (view, { p0, p1 }: IPointPair) => {
  //   const renderer = canvas.getRenderer(view);
  //   if (renderer instanceof Renderer2D) {
  //     renderer.createAnnotation({ p0, p1 });
  //   }
  // },
  // deleteAnnotation: async (view) => {
  //   const renderer = canvas.getRenderer(view);
  //   if (renderer instanceof Renderer2D) {
  //     renderer.deleteAnnotation();
  //   }
  // }
});

export const registerActions = (registry: ActionFunctionRegistry, canvas: BrainvisCanvasComponent) => {
  const actions = getActions(canvas);

  Object.keys(actions).forEach(actionName => {
    registry.register(actionName, actions[actionName]);
  });
};
