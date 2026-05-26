import { Component, OnInit, ViewChild } from '@angular/core';
import { ProvenanceService } from '../../../shared/_services';

import { AuthenticationService } from '../../../shared/_services';
import { User, Role } from '../../../shared/_models';
import { Router } from '@angular/router';
import { AiAssistantPanelComponent } from '../../../components/ai-assistant-panel/ai-assistant-panel.component';

@Component({ templateUrl: 'exploration.component.html', styleUrls: ['exploration.component.css'] })

export class ExplorationComponent implements OnInit {
    title = 'exploration';

    @ViewChild('aiPanel') aiPanel: AiAssistantPanelComponent;

    currentUser: User;
    studyStarted: boolean = true;
    IDcreator: number;

    constructor(
        private authenticationService: AuthenticationService,
        public provenance: ProvenanceService
    ) {
        this.currentUser = this.authenticationService.currentUserValue;
        this.IDcreator = this.currentUser ? (this.currentUser as any).username : 0;
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