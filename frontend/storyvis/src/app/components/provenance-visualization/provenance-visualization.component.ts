import { Component, ElementRef, OnInit, ViewEncapsulation } from '@angular/core';
import { ProvenanceService, AuthenticationService } from '../../shared/_services';
import { ProvenanceTreeVisualization } from '@visualstorytelling/provenance-tree-visualization';
import { Settings } from '../brainvis-canvas/utils/settings';
import { setNewAddListeners } from '../../components/brainvis-canvas/provenanceHelpers/provenanceListeners';

@Component({
  selector: 'app-provenance-visualization',
  template: '',
  styleUrls: ['./provenance-visualization.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class ProvenanceVisualizationComponent implements OnInit {
  public _viz: ProvenanceTreeVisualization;
  public settings = Settings.getInstance(this);

  constructor(public elementRef: ElementRef, public provenance: ProvenanceService) {
  }

  ngOnInit() {
    (window as any).tree = this;
    var traverser = this.provenance.traverser;
    this.createTree(traverser);

    document.onkeydown = this.keyPress;
  }


  createTree(traverser) {
    return this._viz = new ProvenanceTreeVisualization(
      traverser,
      this.elementRef.nativeElement,
      "ProvGraph"
    );
  }

  addListeners(registry, tracker) {
    setNewAddListeners(registry, tracker);
  }

  keyPress(e: any) {
    var evtobj = window.event ? event : e;
    var graph = (window as any).prov.graph;

    // ctrl + Z  / undo
    if (evtobj.keyCode === 38 && evtobj.altKey && graph.current.parent) {
      (window as any).tree._viz.traverser.toStateNode(graph.current.parent.id, 250);
      (window as any).tree._viz.update();
    }
    // ctrl + X  / go to the root
    else if (evtobj.keyCode === 88 && evtobj.altKey) {
      (window as any).tree._viz.traverser.toStateNode(graph.root.id, 250);
      (window as any).tree._viz.update();
    }
    // ctrl + A  / redo
    else if (evtobj.keyCode === 40 && evtobj.altKey && graph.current.children[0]) {
      (window as any).tree._viz.traverser.toStateNode(graph.current.children[0].id, 250);
      (window as any).tree._viz.update();
    }
    // ctrl + Q  / add the current node to the story
    else if (evtobj.keyCode === 81 && evtobj.altKey) {
      graph.current.metadata.story = true;
      (window as any).slideDeck.onAdd(graph.current);
      (window as any).tree._viz.update();
    }
    // ctrl + IntlBackslash  / create a story with all nodes (by creation order)
    else if (evtobj.keyCode === 192 && evtobj.altKey) {
      let nodes = graph.getNodes();
      for (const nodeId of Object.keys(nodes)) {
        let node = nodes[nodeId];
        node.metadata.story = true;
        (window as any).slideDeck.onAdd(node);
      }
      (window as any).tree._viz.update();
    }
    // ctrl + 1  / all neighbour nodes are added to the slide deck (by creation order)
    else if (evtobj.keyCode === 49 && evtobj.altKey) {
      let nodes = graph.getNodes();
      var arrayNodes = [];

      for (const nodeId of Object.keys(nodes)) {
        let node = nodes[nodeId];
        arrayNodes.push(node);
      }

      for (const node of arrayNodes) {
        if (((node.metadata.creationOrder > graph.current.metadata.creationOrder - 2) == true) &&     // the range can be adjusted
          ((node.metadata.creationOrder < graph.current.metadata.creationOrder + 2) == true)) {
          node.metadata.story = true;
          (window as any).slideDeck.onAdd(node);
        }
        (window as any).tree._viz.update();
      }
    }

    // ctrl + W  / derivation and annotation (by creation order)
    else if (evtobj.keyCode === 87 && evtobj.altKey) {
      let nodes = graph.getNodes();
      var arrayNodes = [];

      for (const nodeId of Object.keys(nodes)) {
        let node = nodes[nodeId];
        arrayNodes.push(node);
      }

      arrayNodes.shift();

      for (const node of arrayNodes.filter((x) => x.action.metadata.userIntent == 'derivation' || 'annotation')) {
        node.metadata.story = true;
        (window as any).slideDeck.onAdd(node);
      }
      (window as any).tree._viz.update();
    }
  }

  // ngAfterViewChecked() {
  //   this._viz.setZoomExtent();
  // }

}

(function () {
  var blockContextMenu;

  blockContextMenu = function (evt: any) {
    evt.preventDefault();
  };

  window.addEventListener('contextmenu', blockContextMenu);
})();