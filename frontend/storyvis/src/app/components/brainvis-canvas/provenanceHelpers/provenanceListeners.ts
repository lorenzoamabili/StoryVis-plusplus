import { ProvenanceTracker, Action } from '@visualstorytelling/provenance-core';
import { debounce } from 'lodash-es';
import { Renderer2D } from '../renderer2d';
import { registerActions } from './provenanceActions';
import { Artifact } from '@visualstorytelling/provenance-core/src/api';
import { Settings } from '../utils/settings';
import { BrainvisCanvasComponent } from '../brainvis-canvas.component';
import { ComparisonComponent } from '../comparison.component';

export function setNewAddListeners(registry, tracker, thisCanvasComparison?: ComparisonComponent): void {
  let settings = Settings.getInstance(this);
  let canvas = thisCanvasComparison ? thisCanvasComparison : settings.canvas;

  // removeListeners(canvas);
  registerActions(registry, canvas);
  addListeners(tracker);
}


//  function removeListeners(canvas): void {

//   let sliceIndexStartListener: EventListener = null;
//   canvas.removeEventListener('sliceIndexChangeStart', sliceIndexStartListener);
//   let sliceIndexEndListener: EventListener = null;
//   canvas.removeEventListener('sliceIndexChanged', sliceIndexEndListener);

//   let perspectiveZoomStartListener: EventListener = null;
//   canvas.removeEventListener('perspectiveCameraZoomStart', perspectiveZoomStartListener);
//   let perspectiveZoomEndListener: EventListener = null;
//   canvas.removeEventListener('perspectiveCameraZoomChanged', perspectiveZoomEndListener);

//   let perspectiveOrientationStartListener: EventListener = null;
//   canvas.removeEventListener('perspectiveCameraOrientationStart', perspectiveOrientationStartListener);
//   let perspectiveOrientationEndListener: EventListener = null;
//   canvas.removeEventListener('perspectiveCameraOrientationChanged', perspectiveOrientationEndListener);

//   let sliceDragStartListener: EventListener = null;
//   canvas.removeEventListener('sliceDragChangeStart', sliceDragStartListener);
//   let sliceDragEndListener: EventListener = null;
//   canvas.removeEventListener('sliceDragChanged', sliceDragEndListener);

//   let sliceZoomStartListener: EventListener = null;
//   canvas.removeEventListener('sliceZoomChangeStart', sliceZoomStartListener);
//   let sliceZoomEndListener: EventListener = null;
//   canvas.removeEventListener('sliceZoomChangeStart', sliceZoomEndListener);

//   let wLChangeListenerW: EventListener = null;
//   canvas.removeEventListener('thresholdValueChangeStartW', wLChangeListenerW);
//   let wLChangeEndListenerW: EventListener = null;
//   canvas.removeEventListener('thresholdValueChangedW', wLChangeEndListenerW);

//   let wLChangeListenerC: EventListener = null;
//   canvas.removeEventListener('thresholdValueChangeStartC', wLChangeListenerC);
//   let wLChangeEndListenerC: EventListener = null;
//   canvas.removeEventListener('thresholdValueChangedC', wLChangeEndListenerC);
// }

// Tracks the cleanup function for the most-recently registered listener set per canvas.
// Calling the cleanup removes all previously attached THREE.EventDispatcher listeners
// so re-calling addListeners (e.g. after newProvenanceGraph) doesn't accumulate stale handlers.
const _listenerCleanups = new WeakMap<object, (() => void)>();

export const addListeners = (tracker: ProvenanceTracker, thisCanvasComparison?: ComparisonComponent): any => {
  let settings = Settings.getInstance(this);
  let canvas = thisCanvasComparison ? thisCanvasComparison : settings.canvas;

  // Remove listeners from any previous call for this canvas
  const prevCleanup = _listenerCleanups.get(canvas);
  if (prevCleanup) { prevCleanup(); }

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
        let domID = '';
        switch (startEvent.changes.sliceOrientation) {
          case 'axial':
            label = 'A #' + event.changes.newIndex;
            domID = 'r0';
            break;
          case 'coronal':
            label = 'C #' + event.changes.newIndex;
            domID = 'r2';
            break;
          case 'sagittal':
            label = 'S #' + event.changes.newIndex;
            domID = 'r3';
            break;
          default:
            label = 'strange index?';
        }
        const action: Action = {
          metadata: {
            userIntent: 'exploration',
            label: label,
            renderer: domID
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
        tracker.applyAction(action, true);
      }
    }, 500, { trailing: true });
    canvas.addEventListener('sliceIndexChanged', sliceIndexEndListener);
  };
  const _dSliceIndexStart = debounce(sliceIndexStartListener, 500, { leading: true });
  canvas.addEventListener('sliceIndexChangeStart', _dSliceIndexStart);


  // // Slice Index Listener for all orientations - Debounced
  // let multipleSliceIndexEndListener: EventListener = null;
  // const multipleSliceIndexStartListener = (startEvent) => {
  //   canvas.removeEventListener('multipleSliceIndexChanged', multipleSliceIndexEndListener);
  //   multipleSliceIndexEndListener = debounce((event: any) => {
  //     if (startEvent.changes.sliceOrientation === event.changes.sliceOrientation) {
  //       let label = '';
  //       let plane = '';
  //       let domID = '';
  //       if(event.changes.domID === ('r00' || 'r22' || 'r33')){
  //         plane = 'lower';
  //       } else if (event.changes.domID === ('r000' || 'r222' || 'r333')) {
  //         plane = 'upper';
  //       }
  //       switch (startEvent.changes.sliceOrientation) {
  //         case 'axial':
  //           label = 'A* ' + plane + ' #' + event.changes.newIndex;
  //           domID = 'r0';
  //           break;
  //         case 'coronal':
  //           label = 'C* ' + plane + ' #' + event.changes.newIndex;
  //           domID = 'r2';
  //           break;
  //         case 'sagittal':
  //           label = 'S* ' + plane + ' #' + event.changes.newIndex;
  //           domID = 'r3';
  //           break;
  //         default:
  //           label = 'strange index?';
  //       }
  //       const action: Action = {
  //         metadata: {
  //           userIntent: 'exploration',
  //           label: label,
  //           renderer: domID
  //         },
  //         do: 'setMultipleSliceIndex',
  //         doArguments: {
  //           args: [startEvent.changes.sliceOrientation, event.changes.newIndex, startEvent.changes.oldIndex, event.changes.domID]
  //         },
  //         undo: 'setMultipleSliceIndex',
  //         undoArguments: {
  //           args: [startEvent.changes.sliceOrientation, startEvent.changes.oldIndex, event.changes.newIndex, event.changes.domID]
  //         }
  //       }
  //       tracker.applyAction(action, true);
  //     }
  //   }, 500, { trailing: true });
  //   canvas.addEventListener('multipleSliceIndexChanged', multipleSliceIndexEndListener);
  // };
  // canvas.addEventListener('multipleSliceIndexChangeStart', debounce(multipleSliceIndexStartListener, 500, { leading: true }));


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
          label: label,
          renderer: 'r1'
        },
        do: 'setPerspectiveCameraZoomLevel',
        doArguments: { args: [event.orientation] },
        undo: 'setPerspectiveCameraZoomLevel',
        undoArguments: { args: [startEvent.orientation] }
      }, true);
    }, 500, { trailing: true });
    canvas.addEventListener('perspectiveCameraZoomChanged', perspectiveZoomEndListener);
  };
  const _dPerspectiveZoomStart = debounce(perspectiveZoomStartListener, 500, { leading: true });
  canvas.addEventListener('perspectiveCameraZoomChangeStart', _dPerspectiveZoomStart);


  // Perspective canvas orientation Listener - Debounced
  let perspectiveOrientationEndListener: EventListener = null;
  const perspectiveOrientationStartListener = (startEvent) => {
    canvas.removeEventListener('perspectiveCameraOrientationChanged', perspectiveOrientationEndListener);
    perspectiveOrientationEndListener = debounce((event: any) => {
      let label = '3D-XYZ ';
      label += ' #' + event.id;

      tracker.applyAction({
        metadata: {
          userIntent: 'exploration',
          label: label,
          renderer: 'r1'
        },
        do: 'setPerspectiveCameraOrientation',
        doArguments: { args: [event.orientation] },
        undo: 'setPerspectiveCameraOrientation',
        undoArguments: { args: [startEvent.orientation] }
      }, true);
    }, 500, { trailing: true });
    canvas.addEventListener('perspectiveCameraOrientationChanged', perspectiveOrientationEndListener);
  };
  const _dPerspectiveOrientationStart = debounce(perspectiveOrientationStartListener, 500, { leading: true });
  canvas.addEventListener('perspectiveCameraOrientationChangeStart', _dPerspectiveOrientationStart);


  // Slice drag Listener - Debounced
  let sliceDragEndListener: EventListener = null;
  const sliceDragStartListener = (startEvent) => {
    canvas.removeEventListener('sliceDragChanged', sliceDragEndListener);
    sliceDragEndListener = debounce((event: any) => {
      let label = '';
      let domID = '';
      switch (startEvent.changes.sliceOrientation) {
        case 'axial':
          label = 'A #';
          label += ' ' + event.changes.newSlicePosition.position[0].toFixed(0);
          label += '/' + event.changes.newSlicePosition.position[1].toFixed(0);
          label += '/' + event.changes.newSlicePosition.position[2].toFixed(0);
          domID = 'r0';
          break;
        case 'coronal':
          label = 'C #';
          label += ' ' + event.changes.newSlicePosition.position[0].toFixed(0);
          label += '/' + event.changes.newSlicePosition.position[1].toFixed(0);
          label += '/' + event.changes.newSlicePosition.position[2].toFixed(0);
          domID = 'r2';
          break;
        case 'sagittal':
          label = 'S #';
          label += ' ' + event.changes.newSlicePosition.position[0].toFixed(0);
          label += '/' + event.changes.newSlicePosition.position[1].toFixed(0);
          label += '/' + event.changes.newSlicePosition.position[2].toFixed(0);
          domID = 'r3';
          break;
        default:
          label = 'strange index?';
      }
      tracker.applyAction({
        metadata: {
          userIntent: 'exploration',
          label: label,
          renderer: domID
        },
        do: 'setSliceDrag',
        doArguments: { args: [event.changes.newSlicePosition, startEvent.changes.sliceOrientation] },
        undo: 'setSliceDrag',
        undoArguments: { args: [startEvent.changes.oldSlicePosition, startEvent.changes.sliceOrientation] }
      }, true);
    }, 500, { trailing: true });
    canvas.addEventListener('sliceDragChanged', sliceDragEndListener);
  };
  const _dSliceDragStart = debounce(sliceDragStartListener, 500, { leading: true });
  canvas.addEventListener('sliceDragChangeStart', _dSliceDragStart);


  // Slice zoom Listener - Debounced
  let sliceZoomEndListener: EventListener = null;
  const sliceZoomStartListener = (startEvent) => {
    canvas.removeEventListener('sliceZoomChanged', sliceZoomEndListener);
    sliceZoomEndListener = debounce((event: any) => {
      let label = '';
      let domID = '';
      switch (startEvent.changes.sliceOrientation) {
        case 'axial':
          label = 'A-zoom';
          label += ' ' + event.changes.newZoom.toFixed(2);
          domID = 'r0';
          break;
        case 'coronal':
          label = 'C-zoom';
          label += ' ' + event.changes.newZoom.toFixed(2);
          domID = 'r2';
          break;
        case 'sagittal':
          label = 'S-zoom';
          label += ' ' + event.changes.newZoom.toFixed(2);
          domID = 'r3';
          break;
        default:
          label = 'strange index?';
      }
      tracker.applyAction({
        metadata: {
          userIntent: 'exploration',
          label: label,
          renderer: domID
        },
        do: 'setSliceZoom',
        doArguments: { args: [event.changes.newZoom, startEvent.changes.sliceOrientation] },
        undo: 'setSliceZoom',
        undoArguments: { args: [startEvent.changes.oldZoom, startEvent.changes.sliceOrientation] }
      }, true);
    }, 500, { trailing: true });
    canvas.addEventListener('sliceZoomChanged', sliceZoomEndListener);
  };
  const _dSliceZoomStart = debounce(sliceZoomStartListener, 500, { leading: true });
  canvas.addEventListener('sliceZoomChangeStart', _dSliceZoomStart);


  let navigationEndListener: EventListener = null;
  const navigationStartListener = (startEvent) => {
    canvas.removeEventListener('navigateChanged', navigationEndListener);
    navigationEndListener = debounce((event: any) => {
      if (startEvent.changes.sliceOrientation === event.changes.sliceOrientation) {
        let label = '';
        let domID = '';
        switch (startEvent.changes.sliceOrientation) {
          case 'axial':
            label = 'selection - A #' + event.changes.newIndex;
            domID = 'r0';
            break;
          case 'coronal':
            label = 'selection - C #' + event.changes.newIndex;
            domID = 'r2';
            break;
          case 'sagittal':
            label = 'selection - S #' + event.changes.newIndex;
            domID = 'r3';
            break;
          default:
            label = 'strange index?';
        }
        const action: Action = {
          metadata: {
            userIntent: 'selection',
            label: label,
            renderer: domID
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
        tracker.applyAction(action, true);
      }
    }, 500, { trailing: true });
    canvas.addEventListener('navigateChanged', navigationEndListener);
  };
  const _dNavigationStart = debounce(navigationStartListener, 500, { leading: true });
  canvas.addEventListener('navigateChangeStart', _dNavigationStart);

  const _artifactCreatedSubs = [];
  canvas.renderers.forEach(renderer => {
    if (renderer instanceof Renderer2D) {
      const sub = renderer.artifactCreated.subscribe((artifact: Artifact) => {
        const action = {
          metadata: {
            userIntent: artifact.measurementType === 'annotation' ? 'annotation' : 'derivation',
            label: artifact.sliceIndexStart !== artifact.sliceIndexEnd ?
              artifact.measurementType + ' - ' + renderer.sliceOrientation + ' #' + artifact.sliceIndexStart + '-' + artifact.sliceIndexEnd :
              artifact.measurementType + ' - ' + renderer.sliceOrientation + ' #' + artifact.sliceIndexStart,
            renderer: renderer.domElement.id
          },
          do: 'renderArtifact',
          doArguments: { args: [renderer.sliceOrientation, artifact] },
          undo: 'removeArtifact',
          undoArguments: { args: [renderer.sliceOrientation, artifact] }
        };
        tracker.applyAction(action, true, artifact);
      });
      _artifactCreatedSubs.push(sub);
    }
  });

  const _navVolumeSub = canvas.navigationVolumeCreated.subscribe(({ sliceOrientation, index }: any) => {
    const action = {
      metadata: {
        userIntent: 'selection',
        label: 'Volume navigation - ' + sliceOrientation + '',
        renderer: sliceOrientation
      },
      do: 'navigateVolume',
      doArguments: { args: [sliceOrientation, index] },
      undo: 'navigateVolume',
      undoArguments: { args: [sliceOrientation, index] }
    };
    tracker.applyAction(action, true);
  });

  const _artifactDeletedSubs = [];
  canvas.renderers.forEach(renderer => {
    if (renderer instanceof Renderer2D) {
      const sub = renderer.artifactDeleted.subscribe((artifact: Artifact) => {
        const action = {
          metadata: {
            userIntent: artifact.measurementType === 'annotation' ? 'annotation' : 'derivation',
            label: artifact.measurementType + ' - deleted' + ' - ' + renderer.sliceOrientation + ' #' + artifact.sliceIndexStart,
            renderer: renderer.domElement.id
          },
          do: 'deleteArtifact',
          doArguments: { args: [renderer.sliceOrientation, artifact] },
          undo: 'renderArtifact',
          undoArguments: { args: [renderer.sliceOrientation, artifact] }
        };
        tracker.applyAction(action, true, artifact);
      });
      _artifactDeletedSubs.push(sub);
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
  const _dWLChangeC = debounce(wLChangeListenerC, 500, { leading: true });
  canvas.addEventListener('thresholdValueChangeStartC', _dWLChangeC);


  // Preset Window Level Changes Listener - Debounced
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
  const _dWLChangeW = debounce(wLChangeListenerW, 500, { leading: true });
  canvas.addEventListener('thresholdValueChangeStartW', _dWLChangeW);


  const _magnificationSub = canvas.magnificationCreated.subscribe((args) => {
    const action = {
      metadata: {
        userIntent: 'configuration',
        label: args.oneView ? 'oneView' + ' - ' + (args.domID ? args.domID : '3D view') : '4Views',
        renderer: args.sliceOrientation
      },
      do: 'changeView',
      doArguments: { args: [args.domID] },
      undo: 'changeView',
      undoArguments: { args: [args.domID] }
    };
    tracker.applyAction(action, true);
  });


  let resetWLEndListener: EventListener = null;
  const resetWLListener = (startEvent) => {
    canvas.removeEventListener('WLChanged', resetWLEndListener);
    resetWLEndListener = debounce((event: any) => {
      const action: Action = {
        metadata: {
          userIntent: 'configuration',
          label: 'WL - ' + event.changes.setting
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
    canvas.addEventListener('WLChanged', resetWLEndListener);
  };
  const _dResetWL = debounce(resetWLListener, 500, { leading: true });
  canvas.addEventListener('WLChangeStarted', _dResetWL);


  let resetConfigEndListener: EventListener = null;
  const resetConfigListener = (startEvent) => {
    canvas.removeEventListener('configChanged', resetConfigEndListener);
    resetConfigEndListener = debounce((event: any) => {
      const action: Action = {
        metadata: {
          userIntent: 'configuration',
          label: 'reset config'
        },
        do: 'setConfig',
        doArguments: {
          args: [event.changes]
        },
        undo: 'setConfig',
        undoArguments: {
          args: [startEvent.changes]
        }
      }
      tracker.applyAction(action, true);
    }, 500, { trailing: true });
    canvas.addEventListener('configChanged', resetConfigEndListener);
  };
  const _dResetConfig = debounce(resetConfigListener, 500, { leading: true });
  canvas.addEventListener('configChangeStarted', _dResetConfig);

  // Register cleanup so re-calling addListeners (e.g. after newProvenanceGraph) removes stale handlers.
  _listenerCleanups.set(canvas, () => {
    canvas.removeEventListener('sliceIndexChangeStart', _dSliceIndexStart);
    canvas.removeEventListener('perspectiveCameraZoomChangeStart', _dPerspectiveZoomStart);
    canvas.removeEventListener('perspectiveCameraOrientationChangeStart', _dPerspectiveOrientationStart);
    canvas.removeEventListener('sliceDragChangeStart', _dSliceDragStart);
    canvas.removeEventListener('sliceZoomChangeStart', _dSliceZoomStart);
    canvas.removeEventListener('navigateChangeStart', _dNavigationStart);
    canvas.removeEventListener('thresholdValueChangeStartC', _dWLChangeC);
    canvas.removeEventListener('thresholdValueChangeStartW', _dWLChangeW);
    canvas.removeEventListener('WLChangeStarted', _dResetWL);
    canvas.removeEventListener('configChangeStarted', _dResetConfig);
    _navVolumeSub.unsubscribe();
    _magnificationSub.unsubscribe();
    _artifactCreatedSubs.forEach(s => s.unsubscribe());
    _artifactDeletedSubs.forEach(s => s.unsubscribe());
  });
}