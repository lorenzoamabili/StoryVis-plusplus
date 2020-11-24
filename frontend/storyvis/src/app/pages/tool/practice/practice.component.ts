import { Component, OnInit } from '@angular/core';
import { ProvenanceService } from '../../../shared/_services';

import { AuthenticationService } from '../../../shared/_services';
import { User, Role } from '../../../shared/_models';
import { Router } from '@angular/router';


@Component({ templateUrl: 'practice.component.html', styleUrls: ['practice.component.css'] })

export class PracticeComponent implements OnInit {
    title = 'practice';

    currentUser: User;
    studyStarted: boolean = false;
    IDcreator: number;

    constructor(
        private authenticationService: AuthenticationService,
        public provenance: ProvenanceService
    ) {
        this.currentUser = this.authenticationService.currentUserValue;
        this.IDcreator = this.currentUser.username;
        this.provenance.timeStart = new Date().getTime();
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