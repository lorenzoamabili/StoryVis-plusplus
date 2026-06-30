import { Component, OnInit, ViewChild } from '@angular/core';
import { ProvenanceService, UserService, SessionService } from '../../../shared/_services';
import { Provenance, Story, TextReport } from '../../../shared/_models';
import { BrainvisCanvasComponent } from '../../../components/brainvis-canvas/brainvis-canvas.component';
import { first } from 'rxjs/operators';

@Component({ templateUrl: 'practice.component.html', styleUrls: ['practice.component.css'] })
export class PracticeComponent implements OnInit {
    title = 'practice';

    @ViewChild('canvas') canvas: BrainvisCanvasComponent;

    studyStarted: boolean = false;
    IDcreator: string;
    readonly isNoProvGraph = false;

    graphs: Provenance[] = [];
    stories: Story[] = [];
    textReports: TextReport[] = [];

    constructor(
        private userService: UserService,
        private sessionService: SessionService,
        public provenance: ProvenanceService
    ) {
        this.IDcreator = this.sessionService.getId();
        this.provenance.timeStart = new Date().getTime();

        this.userService.getAllGraphs(this.IDcreator).pipe(first()).subscribe(
            graphs => { this.graphs = graphs; },
            err => { console.warn('getAllGraphs failed', err); }
        );
        this.userService.getAllStories(this.IDcreator).pipe(first()).subscribe(
            stories => { this.stories = stories; },
            err => { console.warn('getAllStories failed', err); }
        );
        this.userService.getAllTextReports(this.IDcreator).pipe(first()).subscribe(
            textReports => { this.textReports = textReports; },
            err => { console.warn('getAllTextReports failed', err); }
        );
    }

    ngOnInit() {}
}
