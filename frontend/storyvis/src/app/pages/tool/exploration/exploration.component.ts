import { Component, OnInit, ViewChild } from '@angular/core';
import { ProvenanceService, SessionService } from '../../../shared/_services';
import { AiAssistantPanelComponent } from '../../../components/ai-assistant-panel/ai-assistant-panel.component';

@Component({ templateUrl: 'exploration.component.html', styleUrls: ['exploration.component.css'] })
export class ExplorationComponent implements OnInit {
    title = 'exploration';

    @ViewChild('aiPanel') aiPanel: AiAssistantPanelComponent;

    studyStarted: boolean = true;
    IDcreator: string;

    readonly isNoProvGraph = false;

    constructor(
        private sessionService: SessionService,
        public provenance: ProvenanceService
    ) {
        this.IDcreator = this.sessionService.getId();
        this.provenance.timeStart = new Date().getTime();
    }

    ngOnInit() {}
}
