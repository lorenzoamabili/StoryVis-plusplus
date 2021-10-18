import { Component, OnInit } from '@angular/core';
import { ProvenanceService, UserService } from '../../../shared/_services';

import { AuthenticationService } from '../../../shared/_services';
import { User, Role, Provenance, Story, TextReport } from '../../../shared/_models';
import { first } from 'rxjs/operators';


@Component({ templateUrl: 'practice.component.html', styleUrls: ['practice.component.css'] })

export class PracticeComponent implements OnInit {
    title = 'practice';

    currentUser: User;
    studyStarted: boolean = false;
    IDcreator: number;

    graphs: Provenance[] = [];
    stories: Story[] = [];
    textReports: TextReport[] = [];

    constructor(
        private userService: UserService,
        private authenticationService: AuthenticationService,
        public provenance: ProvenanceService
    ) {
        this.currentUser = this.authenticationService.currentUserValue;
        this.IDcreator = this.currentUser.username;
        this.provenance.timeStart = new Date().getTime();

        this.userService.getAllGraphs().pipe(first()).subscribe(graphs => {
            this.graphs = graphs;
        });
        this.userService.getAllStories().pipe(first()).subscribe(stories => {
            this.stories = stories;
        });
        this.userService.getAllTextReports().pipe(first()).subscribe(textReports => {
            this.textReports = textReports;
        });
    }

    ngOnInit() {
    }

    get isAdmin() {
        return this.currentUser && this.currentUser.role === Role.Admin;
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
}