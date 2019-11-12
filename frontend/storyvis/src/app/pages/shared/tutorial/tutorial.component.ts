import { Component, OnInit } from '@angular/core';

import { User } from '../../../shared/_models';
import { AuthenticationService, ProvenanceService } from '../../../shared/_services';
import { Role } from '../../../shared/_models'

@Component({ templateUrl: 'tutorial.component.html', styleUrls: ['tutorial.component.css']})
export class TutorialComponent implements OnInit {
    currentUser: User;

    constructor( 
        private authenticationService: AuthenticationService,
        public provenance: ProvenanceService,
        ) {
            this.currentUser = this.authenticationService.currentUserValue;
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