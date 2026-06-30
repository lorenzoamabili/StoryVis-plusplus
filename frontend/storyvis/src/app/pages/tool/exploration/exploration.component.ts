import { Component, OnInit, ViewChild } from '@angular/core';
import { ProvenanceService, SessionService } from '../../../shared/_services';
import { AiAssistantPanelComponent } from '../../../components/ai-assistant-panel/ai-assistant-panel.component';
import { ProvenanceVisualizationComponent } from '../../../components/provenance-visualization/provenance-visualization.component';

@Component({ templateUrl: 'exploration.component.html', styleUrls: ['exploration.component.css'] })
export class ExplorationComponent implements OnInit {
    title = 'exploration';

    @ViewChild('aiPanel') aiPanel: AiAssistantPanelComponent;
    @ViewChild(ProvenanceVisualizationComponent) provViz: ProvenanceVisualizationComponent;

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
            if (panel === 'prov') {
                // Wait for CSS transition (200ms) then force D3 to re-layout
                setTimeout(() => { if (this.provViz) { this.provViz.refresh(); } }, 230);
            }
        }
    }
}
