import { Injectable } from '@angular/core';

import { Application } from '../../../../../provenance-core/src/api';
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