import { Injectable } from '@angular/core';

import { Application } from '../../../../../provenance-core/src/api';
import {
  ProvenanceGraph,
  ProvenanceTracker,
  ProvenanceGraphTraverser,
  ActionFunctionRegistry,
  restoreProvenanceGraph,
  ProvenanceSlidedeck
} from '@visualstorytelling/provenance-core';

import { HttpClient } from '@angular/common/http';

import { Provenance, Story, ProvenancePractice, StoryPractice, TextReportPractice, TextReport } from '../_models';
import { environment } from '../../../environments/environment';
import { SlideDeckVisualization } from '@visualstorytelling/slide-deck-visualization';
import { UserService } from './user.service';
import { MatSelectChange } from '@angular/material';
import { ProvenanceVisualizationComponent } from '../../components/provenance-visualization/provenance-visualization.component';

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
  public graphLoaded = false;

  public userService: UserService;

  public async saveGraph(IDcreator: Number) {
    // this.tracker.getGraph().nodes.filter((x) => x.artifacts[0].type == 'annotation').forEach((x) => x.artifacts[0].elmAttributes[2] = );
    const sJson = JSON.stringify(this.tracker.getGraph());
    console.log(sJson);
    this.http.post<Provenance>(`${environment.apiUrl}/provGraphs/provenance`,
      {
        serializedGraph: sJson,
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

  public async saveStory(IDcreator: Number) {
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

  public async saveTextReport(IDcreator: Number) {
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


  public async saveGraphPractice(IDcreator: Number) {
    const sJson = JSON.stringify(this.tracker.getGraph());
    this.http.post<ProvenancePractice>(`${environment.apiUrl}/provGraphsPractice/provenance`,
      {
        serializedGraph: sJson,
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

  public async saveStoryPractice(IDcreator: Number) {
    this.deck = (window as any).deck;
    const sJson = JSON.stringify(this.deck.serializeSelf());
    this.http.post<StoryPractice>(`${environment.apiUrl}/storiesPractice/story`,
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

  public async saveTextReportPractice(IDcreator: Number) {
    const textArea = document.getElementById("textArea") as HTMLTextAreaElement;
    this.textReport = textArea.value;
    this.http.post<TextReportPractice>(`${environment.apiUrl}/textReportsPractice/textReport`,
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



  public async restoreGraph(input: MatSelectChange) {
    const graphInput = input.value;
    this.loadGraph(graphInput);
    this.graphLoaded = true;
  }

  public loadGraph(graphInput: any) {
    const dataGraph = JSON.parse(graphInput.serializedGraph);
    this.graph = restoreProvenanceGraph(dataGraph);
    this.registry = new ActionFunctionRegistry();
    this.tracker = new ProvenanceTracker(this.registry, this.graph);
    this.traverser = new ProvenanceGraphTraverser(this.registry, this.graph, this.tracker);
    this.tree = (window as any).tree;

    if (this.tree.currentUser.role === 'Author') {
      this.tree.createTree(this.traverser);
    } else {
      this.tree._viz.setTraverser(this.traverser);
    }

    this.tree._viz.update();
    let elem = document.getElementById('fake');
    elem.click();
  }


  public async restoreStory(input: MatSelectChange) {
    const storyInput = input.value;
    this.loadStory(storyInput);
  }

  public loadStory(storyInput: any) {
    const dataStory = JSON.parse(storyInput.story);
    this.slideDeck = (window as any).slideDeck;
    this.slideDeck.setDeck(this.deck.restoreSelf(dataStory, this.traverser, this.graph, this.application));
    this.slideDeck.update();
  }

  public async restoreTextReport(input: MatSelectChange) {
    const textReportInput = input.value;
    this.loadTextReport(textReportInput);
  }

  public loadTextReport(textReportInput: any) {
    (document.getElementById("textArea") as HTMLTextAreaElement).value = textReportInput.textReport;
  }

  async init() {
    this.graph = new ProvenanceGraph({ name: 'storyvis', version: '1.0.0' }, "originalGraph", undefined);
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




