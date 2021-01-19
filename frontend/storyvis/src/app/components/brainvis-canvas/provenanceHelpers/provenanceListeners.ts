import { ProvenanceTracker, Action } from '@visualstorytelling/provenance-core';
import { debounce } from 'lodash-es';
import { Renderer2D } from '../renderer2d';
import { registerActions } from './provenanceActions';
import { Artifact } from '@visualstorytelling/provenance-core/src/api';
import { Settings } from '../utils/settings';

export function setNewAddListeners(registry, tracker): void {
  let settings = Settings.getInstance(this);
  let canvas = settings.canvas;

  registerActions(registry, canvas);
  addListeners(tracker);
}

export const addListeners = (tracker: ProvenanceTracker): any => {
  let settings = Settings.getInstance(this);
  let canvas = settings.canvas;

  // Naive way to reset the canvas after restoring a provenance graph 
  // let elem = document.createElement('button');
  // elem.setAttribute('id', 'fake');
  // elem.style.display = "none";
  // elem.addEventListener('click', resetCanvas);
  // document.body.appendChild(elem);

  // function resetCanvas(e: Event) {
  //   registerActions(canvas.provenance.registry, canvas);
  //   addListeners(canvas.provenance.tracker);
  //   canvas.addEventListeners();
  // }

  // Slice Index Listener for all orientations - Debounced
  let sliceIndexEndListener: EventListener = null;
  const sliceIndexStartListener = (startEvent) => {
    canvas.removeEventListener('sliceIndexChanged', sliceIndexEndListener);
    sliceIndexEndListener = debounce((event: any) => {
      if (startEvent.changes.sliceOrientation === event.changes.sliceOrientation) {
        let label = '';
        switch (startEvent.changes.sliceOrientation) {
          case 'axial':
            label = 'A #' + event.changes.newIndex;
            break;
          case 'coronal':
            label = 'C #' + event.changes.newIndex;
            break;
          case 'sagittal':
            label = 'S #' + event.changes.newIndex;
            break;
          default:
            label = 'strange index?';
        }
        const action: Action = {
          metadata: {
            userIntent: 'exploration',
            label: label
          },
          do: 'setSliceIndex',
          doArguments: {
            args: [startEvent.changes.sliceOrientation, event.changes.newIndex, startEvent.changes.oldIndex]
          },
          undo: 'setSliceIndex',
          undoArguments: {
            args: [startEvent.changes.sliceOrientation, startEvent.changes.oldIndex, event.changes.newIndex]
          }
        }
        tracker.applyAction(action);
      }
    }, 500, { trailing: true });
    canvas.addEventListener('sliceIndexChanged', sliceIndexEndListener);
  };
  canvas.addEventListener('sliceIndexChangeStart', debounce(sliceIndexStartListener, 500, { leading: true }));

  // Perspective canvas zoom Listener - Debounced
  let perspectiveZoomEndListener: EventListener = null;
  const perspectiveZoomStartListener = (startEvent) => {
    canvas.removeEventListener('perspectiveCameraZoomChanged', perspectiveZoomEndListener);
    perspectiveZoomEndListener = debounce((event: any) => {
      let label = '3D-zoom ';
      // label += ' ' + event.orientation.position[0].toFixed(0);
      // label += '/' + event.orientation.position[1].toFixed(0);
      // label += '/' + event.orientation.position[2].toFixed(0);
      label += ' #' + event.id;

      tracker.applyAction({
        metadata: {
          userIntent: 'exploration',
          label: label
        },
        do: 'setPerspectiveCameraZoomLevel',
        doArguments: { args: [event.orientation] },
        undo: 'setPerspectiveCameraZoomLevel',
        undoArguments: { args: [startEvent.orientation] }
      }, true);
    }, 500, { trailing: true });
    canvas.addEventListener('perspectiveCameraZoomChanged', perspectiveZoomEndListener);
  };
  canvas.addEventListener('perspectiveCameraZoomChangeStart', debounce(perspectiveZoomStartListener, 500, { leading: true }));


  // Perspective canvas orientation Listener - Debounced
  let perspectiveOrientationEndListener: EventListener = null;
  const perspectiveOrientationStartListener = (startEvent) => {
    canvas.removeEventListener('perspectiveCameraOrientationChanged', perspectiveOrientationEndListener);
    perspectiveOrientationEndListener = debounce((event: any) => {
      let label = '3D-XYZ ';
      // label += ' ' + event.orientation.position[0].toFixed(0);
      // label += '/' + event.orientation.position[1].toFixed(0);
      // label += '/' + event.orientation.position[2].toFixed(0);
      label += ' #' + event.id;

      tracker.applyAction({
        metadata: {
          userIntent: 'exploration',
          label: label
        },
        do: 'setPerspectiveCameraZoomLevel',
        doArguments: { args: [event.orientation] },
        undo: 'setPerspectiveCameraZoomLevel',
        undoArguments: { args: [startEvent.orientation] }
      }, true);
    }, 500, { trailing: true });
    canvas.addEventListener('perspectiveCameraOrientationChanged', perspectiveOrientationEndListener);
  };
  canvas.addEventListener('perspectiveCameraOrientationChangeStart', debounce(perspectiveOrientationStartListener, 500, { leading: true }));


  // Slice Index Listener for all orientations - Debounced
  let sliceDragEndListener: EventListener = null;
  const sliceDragStartListener = (startEvent) => {
    canvas.removeEventListener('sliceDragChanged', sliceDragEndListener);
    sliceDragEndListener = debounce((event: any) => {
      let label = '';
      switch (startEvent.changes.sliceOrientation) {
        case 'axial':
          label = 'A #';
          label += ' ' + event.changes.newSlicePosition.position[0].toFixed(0);
          label += '/' + event.changes.newSlicePosition.position[1].toFixed(0);
          label += '/' + event.changes.newSlicePosition.position[2].toFixed(0);
          break;
        case 'coronal':
          label = 'C #';
          label += ' ' + event.changes.newSlicePosition.position[0].toFixed(0);
          label += '/' + event.changes.newSlicePosition.position[1].toFixed(0);
          label += '/' + event.changes.newSlicePosition.position[2].toFixed(0);
          break;
        case 'sagittal':
          label = 'S #';
          label += ' ' + event.changes.newSlicePosition.position[0].toFixed(0);
          label += '/' + event.changes.newSlicePosition.position[1].toFixed(0);
          label += '/' + event.changes.newSlicePosition.position[2].toFixed(0);
          break;
        default:
          label = 'strange index?';
      }
      tracker.applyAction({
        metadata: {
          userIntent: 'exploration',
          label: label
        },
        do: 'setSliceDrag',
        doArguments: { args: [event.changes.newSlicePosition, startEvent.changes.sliceOrientation] },
        undo: 'setSliceDrag',
        undoArguments: { args: [startEvent.changes.oldSlicePosition, startEvent.changes.sliceOrientation] }
      }, true);
    }, 500, { trailing: true });
    canvas.addEventListener('sliceDragChanged', sliceDragEndListener);
  };
  canvas.addEventListener('sliceDragChangeStart', debounce(sliceDragStartListener, 500, { leading: true }));


  // Slice Index Listener for all orientations - Debounced
  let sliceZoomEndListener: EventListener = null;
  const sliceZoomStartListener = (startEvent) => {
    canvas.removeEventListener('sliceZoomChanged', sliceZoomEndListener);
    sliceZoomEndListener = debounce((event: any) => {
      let label = '';
      switch (startEvent.changes.sliceOrientation) {
        case 'axial':
          label = 'A-zoom';
          label += ' ' + event.changes.newZoom.toFixed(2);
          break;
        case 'coronal':
          label = 'C-zoom';
          label += ' ' + event.changes.newZoom.toFixed(2);
          break;
        case 'sagittal':
          label = 'S-zoom';
          label += ' ' + event.changes.newZoom.toFixed(2);
          break;
        default:
          label = 'strange index?';
      }
      tracker.applyAction({
        metadata: {
          userIntent: 'exploration',
          label: label
        },
        do: 'setSliceZoom',
        doArguments: { args: [event.changes.newZoom, startEvent.changes.sliceOrientation] },
        undo: 'setSliceZoom',
        undoArguments: { args: [startEvent.changes.oldZoom, startEvent.changes.sliceOrientation] }
      }, true);
    }, 500, { trailing: true });
    canvas.addEventListener('sliceZoomChanged', sliceZoomEndListener);
  };
  canvas.addEventListener('sliceZoomChangeStart', debounce(sliceZoomStartListener, 500, { leading: true }));

  canvas.renderers.forEach(renderer => {
    if (renderer instanceof Renderer2D) {
      renderer.artifactCreated.subscribe((artifact: Artifact) => {
        const action = {
          metadata: {
            userIntent: artifact.measurementType === 'annotation' ? 'annotation' : 'derivation',
            label: artifact.measurementType + ' - ' + renderer.sliceOrientation + ' #' + artifact.sliceIndex
          },
          do: 'renderArtifact',
          doArguments: { args: [renderer.sliceOrientation, artifact] },
          undo: 'removeArtifact',
          undoArguments: { args: [renderer.sliceOrientation, artifact] }
        };
        tracker.applyAction(action, true, artifact);
      });
    }
  });


  canvas.renderers.forEach(renderer => {
    if (renderer instanceof Renderer2D) {
      renderer.artifactDeleted.subscribe((artifact: Artifact) => {
        const action = {
          metadata: {
            userIntent: artifact.measurementType === 'annotation' ? 'annotation' : 'derivation',
            label: artifact.measurementType + ' - deleted'
          },
          do: 'deleteArtifact',
          doArguments: { args: [renderer.sliceOrientation, artifact] },
          undo: 'renderArtifact',
          undoArguments: { args: [renderer.sliceOrientation, artifact] }
        };
        tracker.applyAction(action, true, artifact);
      });
    }
  });


  // Window Level Changes Listener - Debounced
  let wLChangeEndListenerC: EventListener = null;
  const wLChangeListenerC = (startEvent) => {
    canvas.removeEventListener('thresholdValueChangedC', wLChangeEndListenerC);
    wLChangeEndListenerC = debounce((event: any) => {
      const action: Action = {
        metadata: {
          userIntent: 'configuration',
          label: event.changes.valueW + 'W' + ' , ' + event.changes.valueC + 'C*'
        },
        do: 'setWindowLevel',
        doArguments: {
          args: [event.changes.valueW, event.changes.valueC, event.changes.slider]
        },
        undo: 'setWindowLevel',
        undoArguments: {
          args: [startEvent.changes.valueW, startEvent.changes.valueC, startEvent.changes.slider]
        }
      }
      tracker.applyAction(action, true);
    }, 500, { trailing: true });
    canvas.addEventListener('thresholdValueChangedC', wLChangeEndListenerC);
  };
  canvas.addEventListener('thresholdValueChangeStartC', debounce(wLChangeListenerC, 500, { leading: true }));



  // Window Level Changes Listener - Debounced
  let wLChangeEndListenerW: EventListener = null;
  const wLChangeListenerW = (startEvent) => {
    canvas.removeEventListener('thresholdValueChangedW', wLChangeEndListenerW);
    wLChangeEndListenerW = debounce((event: any) => {
      const action: Action = {
        metadata: {
          userIntent: 'configuration',
          label: event.changes.valueW + 'W*' + ' , ' + event.changes.valueC + 'C'
        },
        do: 'setWindowLevel',
        doArguments: {
          args: [event.changes.valueW, event.changes.valueC, event.changes.slider]
        },
        undo: 'setWindowLevel',
        undoArguments: {
          args: [startEvent.changes.valueW, startEvent.changes.valueC, startEvent.changes.slider]
        }
      }
      tracker.applyAction(action, true);
    }, 500, { trailing: true });
    canvas.addEventListener('thresholdValueChangedW', wLChangeEndListenerW);
  };
  canvas.addEventListener('thresholdValueChangeStartW', debounce(wLChangeListenerW, 500, { leading: true }));



  canvas.renderers.forEach(renderer => {
    renderer.magnificationCreated.subscribe((args) => {
      const action = {
        metadata: {
          userIntent: 'configuration',
          label: args.oneView ? 'oneView' + ' - ' + (args.domID ? args.domID : '3D view') : '4Views'
        },
        do: 'changeView',
        doArguments: { args: [args.domID] },
        undo: 'changeView',
        undoArguments: { args: [args.domID] }
      };
      tracker.applyAction(action, true);
    })
  });


  canvas.resetWLCreated.subscribe((parameters) => {
    const action = {
      metadata: {
        userIntent: 'configuration',
        label: 'WL setting #' + parameters.setting
      },
      do: 'resetWindowLevel',
      doArguments: { args: [parameters.setting] },
      undo: 'setWindowLevel',
      undoArguments: { args: [parameters.valueW, parameters.valueC, parameters.slider] }
    };
    tracker.applyAction(action, true);
  });


  canvas.slicesLocationCreated.subscribe((parameters) => {
    const action = {
      metadata: {
        userIntent: 'configuration',
        label: 'slices relocation'
      },
      do: 'resetSlicesLocation',
      doArguments: { args: [] },
      undo: 'changeSlicesLocation',
      undoArguments: { args: [parameters] }
    };
    tracker.applyAction(action, true);
  });

  canvas.resetConfigCreated.subscribe((parameters) => {
    const action = {
      metadata: {
        userIntent: 'configuration',
        label: 'reset config'
      },
      do: 'resetConfig',
      doArguments: { args: [] },
      undo: 'setConfig',
      undoArguments: { args: [parameters] }
    };
    tracker.applyAction(action, true);
  });

  canvas.nullCreated.subscribe(() => {
    const action = {
      metadata: {
        userIntent: 'provenance',
        label: 'new graph'
      },
      do: 'null',
      doArguments: { args: [] },
      undo: 'null',
      undoArguments: { args: [] }
    };
    tracker.applyAction(action, true);
  });
}