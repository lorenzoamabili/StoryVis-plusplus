import { Component, OnInit } from '@angular/core';
import { ProvenanceService } from '../../shared/_services';

import { AuthenticationService } from '../../shared/_services';
import { User, Role } from '../../shared/_models';

@Component({ templateUrl: 'tool.component.html' })

export class ToolComponent implements OnInit {
    title = 'tool';

    currentUser: User;
    IDcreator: number;

    constructor(
        private authenticationService: AuthenticationService,
        public provenance: ProvenanceService,
    ) {
        this.currentUser = this.authenticationService.currentUserValue;
        this.IDcreator = this.currentUser.username;
    }

    ngOnInit() {

    }
    get isAdmin() {
        return this.currentUser && this.currentUser.role === Role.Admin;
    }

    get isAuthor() {
        return this.currentUser && this.currentUser.role === Role.Author;
    }

    get isReader() {
        return this.currentUser && this.currentUser.role === Role.Reader;
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