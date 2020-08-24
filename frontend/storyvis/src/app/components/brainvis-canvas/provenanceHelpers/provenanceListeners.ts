import { ProvenanceTracker, Action } from '@visualstorytelling/provenance-core';
import { debounce } from 'lodash';
import { BrainvisCanvasComponent } from '../brainvis-canvas.component';
import { Renderer2D } from '../renderer2d';
import { registerActions } from './provenanceActions';
import { Settings } from '../utils/settings';

export const addListeners = (tracker: ProvenanceTracker, canvas: BrainvisCanvasComponent) => {


  // Naive way to reset the canvas after restoring a proveance graphs 
  let elem = document.createElement('button');
  elem.setAttribute('id', 'fake');
  elem.style.display = "none";
  elem.addEventListener('click', resetCanavas);
  document.body.appendChild(elem);

  function resetCanavas(e: Event) {
    registerActions(canvas.provenance.registry, canvas);
    addListeners(canvas.provenance.tracker, canvas);
    canvas.addEventListeners();
  }


  canvas.addEventListener('sliceOrientationChanged', (event: any) => {
    const { position, direction, oldPosition, oldDirection } = event.changes;
    tracker.applyAction({
      metadata: { userIntent: 'exploration' },
      do: 'setSlicePlaneOrientation',
      doArguments: { args: [position, direction] },
      undo: 'setSlicePlaneOrientation',
      undoArguments: { args: [oldPosition, oldDirection] }
    });
  });

  canvas.addEventListener('sliceZoomChanged', (event: any) => {
    const { position, direction, oldPosition, oldDirection } = event.changes;
    tracker.applyAction({
      metadata: { userIntent: 'exploration' },
      do: 'setSlicePlaneZoom',
      doArguments: { args: [position, direction] },
      undo: 'setSlicePlaneZoom',
      undoArguments: { args: [oldPosition, oldDirection] }
    }, true);
  });


  canvas.addEventListener('AxialZoomChanged', (event: any) => {
    const { position, direction, oldPosition, oldDirection } = event.changes;
    tracker.applyAction({
      metadata: { userIntent: 'exploration' },
      do: 'setAxialZoom',
      doArguments: { args: [position, direction] },
      undo: 'setAxialZoom',
      undoArguments: { args: [oldPosition, oldDirection] }
    }, true);
  });


  canvas.addEventListener('SagittalZoomChanged', (event: any) => {
    const { position, direction, oldPosition, oldDirection } = event.changes;
    tracker.applyAction({
      metadata: { userIntent: 'exploration' },
      do: 'setSagittalZoom',
      doArguments: { args: [position, direction] },
      undo: 'setSagittalZoom',
      undoArguments: { args: [oldPosition, oldDirection] }
    }, true);
  });


  canvas.addEventListener('CoronalZoomChanged', (event: any) => {
    const { position, direction, oldPosition, oldDirection } = event.changes;
    tracker.applyAction({
      metadata: { userIntent: 'exploration' },
      do: 'setCoronalZoom',
      doArguments: { args: [position, direction] },
      undo: 'setCoronalZoom',
      undoArguments: { args: [oldPosition, oldDirection] }
    }, true);
  });


  // canvas.settings.alignModeChange.subscribe(val => {
  //   tracker.applyAction({
  //     metadata: {userIntent: 'configuration'},
  //     do: 'alignMode',
  //     doArguments: [val],
  //     undo: 'alignMode',
  //     undoArguments: [!val],
  //   }, true);
  // });



  // Slice Index Listener for all orientations - Debounced
  let sliceIndexEndListener: EventListener = null;
  const sliceIndexStartListener = (startEvent) => {
    canvas.removeEventListener('sliceIndexChanged', sliceIndexEndListener);
    sliceIndexEndListener = debounce((event: any) => {
      let label = '';
      switch (startEvent.changes.sliceOrientation) {
        case 'axial':
          label = 'Axial    #: ' + event.changes.newIndex;
          break;
        case 'coronal':
          label = 'Coronal  #: ' + event.changes.newIndex;
          break;
        case 'sagittal':
          label = 'Sagittal #: ' + event.changes.newIndex;
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
          args: [startEvent.changes.sliceOrientation, event.changes.newIndex, startEvent.changes.oldIndex, event.changes.newIndex]
                },
        undo: 'setSliceIndex',
        undoArguments: {
          args: [startEvent.changes.sliceOrientation, startEvent.changes.oldIndex, startEvent.changes.newIndex, event.changes.oldIndex]
        }
      }
      tracker.applyAction(action);
    }, 500, { trailing: true });
    canvas.addEventListener('sliceIndexChanged', sliceIndexEndListener);
  };
  canvas.addEventListener('sliceIndexChangeStart', debounce(sliceIndexStartListener, 500, { leading: true }));

  // Perspective canvas zoom Listener - Debounced
  let perspectiveZoomEndListener: EventListener = null;
  const perspectiveZoomStartListener = (startEvent) => {
    canvas.removeEventListener('perspectiveCameraZoomChanged', perspectiveZoomEndListener);
    perspectiveZoomEndListener = debounce((event: any) => {
      let label = 'P ZOOM:';
      label += ' ' + event.orientation.position[0].toFixed(0);
      label += '/' + event.orientation.position[1].toFixed(0);
      label += '/' + event.orientation.position[2].toFixed(0);

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
      let label = 'P XYZ :';
      label += ' ' + event.orientation.position[0].toFixed(0);
      label += '/' + event.orientation.position[1].toFixed(0);
      label += '/' + event.orientation.position[2].toFixed(0);
      tracker.applyAction({
        metadata: {
          userIntent: 'exploration',
          label: label
        },
        do: 'setPerspectiveCameraOrientation',
        doArguments: { args: [event.orientation] },
        undo: 'setPerspectiveCameraOrientation',
        undoArguments: { args: [startEvent.orientation] }
      }, true);
    }, 500, { trailing: true });
    canvas.addEventListener('perspectiveCameraOrientationChanged', perspectiveOrientationEndListener);
  };
  canvas.addEventListener('perspectiveCameraOrientationChangeStart', debounce(perspectiveOrientationStartListener, 500, { leading: true }));


  canvas.renderers.forEach(renderer => {
    if (renderer instanceof Renderer2D) {
      // renderer.rulerRemoved.subscribe((args) => {
      //   const action = {
      //     metadata: {
      //       userIntent: 'measurement',
      //       label: 'delete ruler'
      //     },
      //     do: 'deleteRuler',
      //     doArguments: [renderer.sliceOrientation],
      //     undo: 'createRuler',
      //     undoArguments: [renderer.sliceOrientation, args],
      //   };
      //   tracker.applyAction(action, true);
      // });

      renderer.artifactCreated.subscribe((artifact) => {
        const action = {
          metadata: {
            userIntent: 'derivation',
            label: artifact.type
          },
          do: 'renderArtifact',
          doArguments: { args: [renderer.sliceOrientation, artifact] },
          undo: 'removeArtifact',
          undoArguments: { args: [renderer.sliceOrientation, artifact] }
        };
        tracker.applyAction(action, true);
      });
    }
  });

  canvas.renderers.forEach(renderer => {
    if (renderer instanceof Renderer2D) {
      renderer.annotationCreated.subscribe((artifact) => {
        const action = {
          metadata: {
            userIntent: 'annotation',
            label: artifact.type
          },
          do: 'renderArtifact',
          doArguments: { args: [renderer.sliceOrientation, artifact] },
          undo: 'removeArtifact',
          undoArguments: { args: [renderer.sliceOrientation, artifact] }
        };
        tracker.applyAction(action, true);
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
          label: 'WL C' + event.changes.value
        },
        do: 'setWindowLevelC',
        doArguments: {
          args: [event.changes.value]
        },
        undo: 'setWindowLevelC',
        undoArguments: {
          args: [startEvent.changes.value]
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
          label: 'WL W' + event.changes.value
        },
        do: 'setWindowLevelW',
        doArguments: {
          args: [event.changes.value]
        },
        undo: 'setWindowLevelW',
        undoArguments: {
          args: [startEvent.changes.value]
        }
      }
      tracker.applyAction(action, true);
    }, 500, { trailing: true });
    canvas.addEventListener('thresholdValueChangedW', wLChangeEndListenerW);
  };
  canvas.addEventListener('thresholdValueChangeStartW', debounce(wLChangeListenerW, 500, { leading: true }));
}