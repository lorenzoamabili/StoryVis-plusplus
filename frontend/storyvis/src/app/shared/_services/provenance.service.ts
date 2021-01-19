import { Injectable } from '@angular/core';

import { Application, ProvenanceNode, StateNode } from '../../../../../provenance-core/src/api';
import {
  ProvenanceGraph,
  ProvenanceTracker,
  ProvenanceGraphTraverser,
  ActionFunctionRegistry,
  ProvenanceSlidedeck
} from '../../../../../node_modules/@visualstorytelling/provenance-core';

import { HttpClient } from '@angular/common/http';

import {
  Provenance, Story, TextReport,
  ProvenanceStudy, StoryStudy, TextReportStudy
} from '../_models';
import { environment } from '../../../environments/environment';
import { SlideDeckVisualization } from '@visualstorytelling/slide-deck-visualization';
import { UserService } from './user.service';
import { ProvenanceVisualizationComponent } from '../../components/provenance-visualization/provenance-visualization.component';
import { setNewAddListeners } from '../../components/brainvis-canvas/provenanceHelpers/provenanceListeners';
import { Settings } from 'src/app/components/brainvis-canvas/utils/settings';

@Injectable({
  providedIn: 'root'
})

export class ProvenanceService {
  public graph: ProvenanceGraph;
  public registry: ActionFunctionRegistry;
  public tracker: ProvenanceTracker;
  public traverser: ProvenanceGraphTraverser;
  public deck: ProvenanceSlidedeck;
  public application: Application;
  public slideDeck: SlideDeckVisualization;
  public tree: ProvenanceVisualizationComponent;
  public textReport: String;
  public initialized = false;
  public findingsCoord: any[] = [];
  public timeStart: number = 0;

  public userService: UserService;
  public settings = Settings.getInstance(this);


  public async saveGraph(IDcreator: number) {
    const sJson = JSON.stringify(this.tracker.getGraph());
    this.http.post<Provenance>(`${environment.apiUrl}/provGraphs/provenance`,
      {
        serializedGraph: sJson,
        IDcreator: IDcreator,
        findingsCoord: this.findingsCoord,
        timeStart: this.timeStart,
        timeEnd: new Date().getTime()
      })
      .subscribe(
        data => {
          console.log("POST Request is successful", data);
        },
        error => {
          console.log("Error", error);
        }
      );
  }

  public async saveStory(IDcreator: number) {
    this.deck = (window as any).deck;
    const sJson = JSON.stringify(this.deck.serializeSelf());
    this.http.post<Story>(`${environment.apiUrl}/stories/story`,
      {
        story: sJson,
        IDcreator: IDcreator
      })
      .subscribe(
        data => {
          console.log("POST Request is successful", data);
        },
        error => {
          console.log("Error", error);
        }
      );
  }

  public async saveTextReport(IDcreator: number) {
    const textArea = document.getElementById("textArea") as HTMLTextAreaElement;
    this.textReport = textArea.value;
    this.http.post<TextReport>(`${environment.apiUrl}/textReports/textReport`,
      {
        textReport: this.textReport,
        IDcreator: IDcreator
      })
      .subscribe(
        data => {
          console.log("POST Request is successful", data);
        },
        error => {
          console.log("Error", error);
        }
      );
  }


  public async saveGraphStudy(IDcreator: number) {
    const sJson = JSON.stringify(this.tracker.getGraph());
    this.http.post<ProvenanceStudy>(`${environment.apiUrl}/provGraphsStudy/provenance`,
      {
        serializedGraph: sJson,
        IDcreator: IDcreator,
        findingsCoord: this.findingsCoord,
        timeStart: this.timeStart,
        timeEnd: new Date().getTime()
      })
      .subscribe(
        data => {
          console.log("POST Request is successful", data);
        },
        error => {
          console.log("Error", error);
        }
      );
  }

  public async saveStoryStudy(IDcreator: number) {
    this.deck = (window as any).deck;
    const sJson = JSON.stringify(this.deck.serializeSelf());
    this.http.post<StoryStudy>(`${environment.apiUrl}/storiesStudy/story`,
      {
        story: sJson,
        IDcreator: IDcreator
      })
      .subscribe(
        data => {
          console.log("POST Request is successful", data);
        },
        error => {
          console.log("Error", error);
        }
      );
  }

  public async saveTextReportStudy(IDcreator: number) {
    const textArea = document.getElementById("textArea") as HTMLTextAreaElement;
    this.textReport = textArea.value;
    this.http.post<TextReportStudy>(`${environment.apiUrl}/textReportsStudy/textReport`,
      {
        textReport: this.textReport,
        IDcreator: IDcreator
      })
      .subscribe(
        data => {
          console.log("POST Request is successful", data);
        },
        error => {
          console.log("Error", error);
        }
      );
  }






  generation(onThisTree?: boolean) {
    if (onThisTree) {
      this.saveGraphStudy(0);
      this.newProvenanceGraph();
      this.graph.root.label = 'New Root';
    } else {
      const action = {
        metadata: {
          userIntent: 'provenance',
          label: 'New Root'
        },
        do: 'null',
        doArguments: { args: [] },
        undo: 'null',
        undoArguments: { args: [] }
      };
      this.tracker.applyAction(action, true, [], 'split', this.graph.root);
    }
  }


  fission(onThisTree?: boolean) {
    if (onThisTree) {
      this.saveGraphStudy(0);
      this.newProvenanceGraph();
    } else {
      const parameters = this.settings.canvas.resetConfigParam();
      const action = {
        metadata: {
          userIntent: 'provenance',
          label: 'New Root'
        },
        do: 'setConfig',
        doArguments: { args: [parameters] },
        undo: 'resetConfig',
        undoArguments: { args: [] }
      };
      this.tracker.applyAction(action, true, parameters.artifacts, 'split');
    }
  }


  splitting() {
    let currentNode = (this.graph.current as StateNode);
    currentNode.action.metadata.userIntent = 'provenance';
    this.tracker.applyAction(currentNode.action, true, currentNode.artifacts, '', currentNode.parent);
  }


  transferring(toNode: StateNode) {
    this.saveGraphStudy(0);
    this.traverser.toCopyNodes(toNode.id, null, true);
    let traverser = this.traverser;
    let currentNodeID = traverser.graph.current.id;
    this.newProvenanceGraph();
    this.traverser.toCopyNodes(currentNodeID, traverser, true);
    (this.graph.current as StateNode).action.metadata.userIntent = 'provenance';
  }


  merging(currentNode: StateNode, nodeTo: StateNode) {
    let newBranchArtifacts = [];
    this.settings.canvas.renderers2D.forEach(renderer => renderer._artifacts.forEach(artifact => newBranchArtifacts.push(artifact)));
    if (newBranchArtifacts.length !== 0) {
      let measurementsCurrent = currentNode.artifacts !== [] ? currentNode.artifacts : [];
      let measurementsToMerge = newBranchArtifacts !== [] ? newBranchArtifacts : [];
      measurementsCurrent.push(...measurementsToMerge);

      if (measurementsCurrent.length !== 0 && measurementsToMerge.length !== 0) {
        const action = {
          metadata: {
            userIntent: "provenance",
            label: 'merging - measurements'
          },
          do: 'renderMeasurements',
          doArguments: { args: [measurementsToMerge] },
          undo: 'removeMeasurements',
          undoArguments: { args: [measurementsCurrent] }
        };

        this.tracker.applyAction(action, true, measurementsCurrent, 'split', nodeTo);
      }
    }
  }


  copying(toNode: StateNode) {
    this.traverser.toCopyNodes(toNode.id, null);
  }



  newProvenanceGraph() {
    this.graph = new ProvenanceGraph({ name: 'storyvis', version: '1.0.0' }, 'newGraph');
    this.registry = new ActionFunctionRegistry();
    this.tracker = new ProvenanceTracker(this.registry, this.graph);
    this.traverser = new ProvenanceGraphTraverser(this.registry, this.graph, this.tracker);

    (window as any).prov = {
      graph: this.graph,
      registry: this.registry,
      tracker: this.tracker,
      traverser: this.traverser,
      deck: this.deck
    };

    this.tree = (window as any).tree;
    this.tree._viz.hideTree();
    this.tree._viz = this.tree.createTree(this.traverser);
    this.tree._viz.update();
    setNewAddListeners(this.registry, this.tracker);
  }



  async init() {
    this.graph = new ProvenanceGraph({ name: 'storyvis', version: '1.0.0' }, "originalGraph");
    this.registry = new ActionFunctionRegistry();
    this.tracker = new ProvenanceTracker(this.registry, this.graph);
    this.traverser = new ProvenanceGraphTraverser(this.registry, this.graph, this.tracker);
    this.deck = new ProvenanceSlidedeck(this.application, this.traverser);

    (window as any).prov = {
      graph: this.graph,
      registry: this.registry,
      tracker: this.tracker,
      traverser: this.traverser,
      deck: this.deck
    };
  }

  constructor(private http: HttpClient) {
    this.init().then(() => this.initialized = true);
  }
}