import { Component, OnInit, Input } from '@angular/core';
import { first } from 'rxjs/operators';
import { AuthenticationService, UserService, ProvenanceService } from '../../../shared/_services';
import { User } from '../../../shared/_models';

@Component({ templateUrl: 'reading-story.component.html', styleUrls: ['reading-story.component.css'] })

export class ReadingStoryComponent implements OnInit {
    title = 'reading-story';

    currentUser: User;
    IDreader: number;

    constructor(
        private authenticationService: AuthenticationService,
        public provenance: ProvenanceService, public userService: UserService
    ) {
        this.currentUser = this.authenticationService.currentUserValue;
        this.IDreader = this.currentUser.username - 100;
    }

    ngOnInit() {
        this.userService.getAllGraphs().pipe(first()).subscribe(graphs => {
            for (let i = 0; i < graphs.length; i++) {
                if (graphs[i].IDcreator == this.IDreader) {
                    const IDgraph = graphs[i]._id;
                    this.userService.getByIdGraphs(IDgraph).pipe(first()).subscribe(graph => {
                        this.provenance.loadGraph(graph);
                    });
                }
            }
        });

        this.userService.getAllStories().pipe(first()).subscribe(stories => {
            for (let i = 0; i < stories.length; i++) {
                if (stories[i].IDcreator == this.IDreader) {
                    const IDstory = stories[i]._id;
                    this.userService.getByIdStories(IDstory).pipe(first()).subscribe(story => {
                        this.provenance.loadStory(story);
                    });
                }
            }
        });
    }

    get isProvGraph() {
        return this.currentUser && this.currentUser.group === "ProvGraph";
    }

    get isPlotTrimmerG() {
        return this.currentUser && this.currentUser.group === "PlotTrimmerG";
    }

    get isPlotTrimmerC() {
        return this.currentUser && this.currentUser.group === "PlotTrimmerC";
    }

    get isNoProvGraph() {
        return this.currentUser && this.currentUser.group === "NoProvGraph";
    }

    get isReportFirst() {
        return this.currentUser.username % 2 === 0;
    }
}