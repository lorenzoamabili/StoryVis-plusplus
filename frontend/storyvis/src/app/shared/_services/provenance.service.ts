import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

import { Application, StateNode } from '../../../../../provenance-core/src/api';
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
import { UserService } from './user.service';
import { ProvenanceVisualizationComponent } from '../../components/provenance-visualization/provenance-visualization.component';
import { setNewAddListeners } from '../../components/brainvis-canvas/provenanceHelpers/provenanceListeners';
import { Settings } from 'src/app/components/brainvis-canvas/utils/settings';
import { MatSelectChange } from '@angular/material/select';
import { SlideDeckVisualization } from '@visualstorytelling/slide-deck-visualization';
import { restoreProvenanceGraph } from '@visualstorytelling/provenance-core/src/ProvenanceGraph';
import { ProvenanceVisualizationComparisonComponent } from 'src/app/components/brainvis-canvas/provenance-visualization-comparison/provenance-visualization-comparison.component';

@Injectable({
  providedIn: 'root'
})

export class ProvenanceService {
  public graph: ProvenanceGraph;
  public registry: ActionFunctionRegistry;
  public tracker: ProvenanceTracker;
  public traverser: ProvenanceGraphTraverser;
  public deck: ProvenanceSlidedeck;
  public tree: ProvenanceVisualizationComponent;
  public slideDeck: SlideDeckVisualization;

  public graphComparison: ProvenanceGraph;
  public registryComparison: ActionFunctionRegistry;
  public trackerComparison: ProvenanceTracker;
  public traverserComparison: ProvenanceGraphTraverser;
  public deckComparison: ProvenanceSlidedeck;
  public treeComparison: ProvenanceVisualizationComparisonComponent;

  public graphEducation: ProvenanceGraph;
  public trackerEducation: ProvenanceTracker;
  public traverserEducation: ProvenanceGraphTraverser;
  
  public application: Application;

  public textReport: string = '';
  public creatorId: string = '';
  public initialized = false;
  /** Emits whenever newProvenanceGraph() creates a fresh graph+traverser. */
  readonly graphReset$ = new Subject<void>();
  public findingsCoord: any[] = [];
  public timeStart: number = 0;
  public comparison: number = null;

  public userService: UserService;
  public settings = Settings.getInstance(this);


  public saveGraph(IDcreator: string | number) {
    if (this.tracker) {
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
  }

  public saveStory(IDcreator: string | number) {
    if (this.deck && this.tracker) {
      const sJson = JSON.stringify(this.deck.serializeSelf());
      const sJsonGraph = JSON.stringify(this.tracker.getGraph());
      this.http.post<Story>(`${environment.apiUrl}/stories/story`,
        {
          story: sJson,
          graph: sJsonGraph,
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
  }

  public saveTextReport(IDcreator: string | number) {
    if (!this.textReport) { return; }
    this.http.post<TextReport>(`${environment.apiUrl}/textReports/textReport`,
      { textReport: this.textReport, IDcreator })
      .subscribe(
        data => { console.log("POST Request is successful", data); },
        error => { console.log("Error", error); }
      );
  }


  public saveGraphStudy(IDcreator: string | number) {
    if (this.tracker) {
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
  }

  public saveStoryStudy(IDcreator: string | number) {
    if (this.deck && this.tracker) {
      const sJson = JSON.stringify(this.deck.serializeSelf());
      const sJsonGraph = JSON.stringify(this.tracker.getGraph());
      this.http.post<StoryStudy>(`${environment.apiUrl}/storiesStudy/story`,
        {
          story: sJson,
          graph: sJsonGraph,
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
  }

  public saveTextReportStudy(IDcreator: string | number) {
    if (!this.textReport) { return; }
    this.http.post<TextReportStudy>(`${environment.apiUrl}/textReportsStudy/textReport`,
      { textReport: this.textReport, IDcreator })
      .subscribe(
        data => { console.log("POST Request is successful", data); },
        error => { console.log("Error", error); }
      );
  }



  public async compareGraphs(input: MatSelectChange) {
    const graphInput = input.value;
    this.compareGraph(graphInput);
  }

  public compareGraph(graphInput: any) {
    try {
      const dataGraph = JSON.parse(graphInput.serializedGraph);
      this.graphComparison = restoreProvenanceGraph(dataGraph) as any;
      this.newGraphComparison(this.graphComparison);
    } catch (e) {
      console.error('compareGraph: failed to parse graph', e);
    }
  }



  public async restoreGraph(input: MatSelectChange) {
    const graphInput = input.value;
    this.loadGraph(graphInput);
  }

  public loadGraph(graphInput: any) {
    try {
      const dataGraph = JSON.parse(graphInput.serializedGraph);
      this.graph = restoreProvenanceGraph(dataGraph) as any;
      this.newProvenanceGraph(this.graph);
    } catch (e) {
      console.error('loadGraph: failed to parse graph', e);
    }
  }



  public async restoreGraphEducation(input: MatSelectChange) {
    const graphInput = input.value;
    this.loadGraphEducation(graphInput);
  }

  public loadGraphEducation(graphInput: any) {
    try {
      const dataGraph = JSON.parse(graphInput.serializedGraph);
      this.graphEducation = restoreProvenanceGraph(dataGraph) as any;
      this.newGraphEducation(this.graphEducation);
    } catch (e) {
      console.error('loadGraphEducation: failed to parse graph', e);
    }
  }



  // public async restoreStory(input: MatSelectChange) {
  //   const storyInput = input.value;
  //   this.loadStory(storyInput);
  // }

  // public loadStory(storyInput: any) {
  //   const dataStory = JSON.parse(storyInput.story);
  //   this.slideDeck = (window as any).slideDeck;
  //   this.slideDeck.setDeck(this.deck.restoreSelf(dataStory, this.traverser, this.graph, this.application));
  //   this.slideDeck.update();
  // }

  // public async restoreTextReport(input: MatSelectChange) {
  //   const textReportInput = input.value;
  //   this.loadTextReport(textReportInput);
  // }

  // public loadTextReport(textReportInput: any) {
  //   (document.getElementById("textArea") as HTMLTextAreaElement).value = textReportInput.textReport;
  // }









  generation(newGraph?: boolean) {
    if (newGraph) {
      this.saveGraph(this.creatorId);
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


  fission() {
      const parameters = this.settings.canvas.configParam();
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


  splitting() {
    let currentNode = (this.graph.current as StateNode);
    currentNode.action.metadata.userIntent = 'provenance';
    this.tracker.applyAction(currentNode.action, true, currentNode.artifacts, '', currentNode.parent);
  }


  transferring(toNode: StateNode) {
    this.saveGraph(this.creatorId);
    this.traverser.copyNodes(toNode.id, null, true);
    let traverser = this.traverser;
    let currentNodeID = traverser.graph.current.id;
    this.newProvenanceGraph();
    this.traverser.copyNodes(currentNodeID, traverser, true);
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
            label: 'merging'
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
    this.saveGraph(this.creatorId);
    this.traverser.copyNodes(toNode.id, null);
    let traverser = this.traverser;
    let currentNodeID = traverser.graph.current.id;
    this.newProvenanceGraph();
    this.traverser.copyNodes(currentNodeID, traverser);
  }


  // newGraphComparison(graph?: ProvenanceGraph) {
  //   this.graphComparison = graph ? graph : new ProvenanceGraph({ name: 'storyvisComparison', version: '1.0.0' });
  //   this.registryComparison = new ActionFunctionRegistry();
  //   this.trackerComparison = new ProvenanceTracker(this.registryComparison, this.graphComparison);
  //   this.traverserEducation = new ProvenanceGraphTraverser(this.registryComparison, this.graphComparison, this.trackerComparison);
  //   // this.deck = new ProvenanceSlidedeck(this.application, this.traverserComparison);

  //   this.settings.isComparisonMode = true;

  //   // setNewAddListeners(this.registryComparison, this.trackerComparison);  
  // }


  newGraphComparison(graph?: ProvenanceGraph) {
    this.graphComparison = graph ? graph : new ProvenanceGraph({ name: 'storyvis', version: '1.0.0' });
    this.registryComparison = new ActionFunctionRegistry();
    this.trackerComparison = new ProvenanceTracker(this.registryComparison, this.graphComparison);
    this.traverserComparison = new ProvenanceGraphTraverser(this.registryComparison, this.graphComparison, this.trackerComparison);
    this.deckComparison = new ProvenanceSlidedeck(this.application, this.traverserComparison);

    (window as any).prov = {
      graphComparison: this.graphComparison,
      registryComparison: this.registryComparison,
      trackerComparison: this.trackerComparison,
      traverserComparison: this.traverserComparison,
      deckComparison: this.deckComparison
    };

    if (this.treeComparison) { this.treeComparison.rewire(this.traverserComparison); }
    
    // if(!this.settings.isEducationMode){
    //   setNewAddListeners(this.registryComparison, this.trackerComparison);
    // }
  }

  newGraphEducation(graph?: ProvenanceGraph) {
    this.graphEducation = graph ? graph : new ProvenanceGraph({ name: 'storyvisEducation', version: '1.0.0' });
    const registryEdu = new ActionFunctionRegistry();
    this.trackerEducation = new ProvenanceTracker(registryEdu, this.graphEducation);
    this.traverserEducation = new ProvenanceGraphTraverser(registryEdu, this.graphEducation, this.trackerEducation);

    if (this.treeComparison) { this.treeComparison.rewire(this.traverserEducation); }

    this.settings.isEducationMode = true;
  }

  

  newProvenanceGraph(graph?: ProvenanceGraph) {
    this.graph = graph ? graph : new ProvenanceGraph({ name: 'storyvis', version: '1.0.0' });
    this.registry = new ActionFunctionRegistry();
    this.tracker = new ProvenanceTracker(this.registry, this.graph);
    this.traverser = new ProvenanceGraphTraverser(this.registry, this.graph, this.tracker);
    // Do NOT assign this.deck here — ProvenanceSlidesComponent owns deck lifecycle.
    // graphReset$ notifies it to create a new deck bound to the fresh traverser.

    (window as any).prov = {
      graph: this.graph,
      registry: this.registry,
      tracker: this.tracker,
      traverser: this.traverser,
    };

    if (this.tree) { this.tree.rewire(this.traverser); }
    setNewAddListeners(this.registry, this.tracker);
    this.graphReset$.next();
  }



  async init() {
    this.graph = new ProvenanceGraph({ name: 'storyvis', version: '1.0.0' });
    this.registry = new ActionFunctionRegistry();
    this.tracker = new ProvenanceTracker(this.registry, this.graph);
    this.traverser = new ProvenanceGraphTraverser(this.registry, this.graph, this.tracker);
    this.deck = new ProvenanceSlidedeck(this.application, this.traverser);

    this.graphComparison = new ProvenanceGraph({ name: 'storyvisComparison', version: '1.0.0' });
    this.registryComparison = new ActionFunctionRegistry();
    this.trackerComparison = new ProvenanceTracker(this.registryComparison, this.graphComparison);
    this.traverserComparison = new ProvenanceGraphTraverser(this.registryComparison, this.graphComparison, this.trackerComparison);
    this.deckComparison = new ProvenanceSlidedeck(this.application, this.traverserComparison);

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