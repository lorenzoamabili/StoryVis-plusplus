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

    /** Right panel state */
    rightOpen = false;
    activePanel: 'prov' | 'bm' | 'ref' | 'ai' = 'prov';

    /** Bottom panel state */
    bottomOpen = false;

    constructor(
        private sessionService: SessionService,
        public provenance: ProvenanceService
    ) {
        this.IDcreator = this.sessionService.getId();
        this.provenance.timeStart = new Date().getTime();
    }

    ngOnInit() {}

    togglePanel(panel: 'prov' | 'bm' | 'ref' | 'ai') {
        if (this.rightOpen && this.activePanel === panel) {
            this.rightOpen = false;
        } else {
            this.activePanel = panel;
            this.rightOpen = true;
        }
    }
}
