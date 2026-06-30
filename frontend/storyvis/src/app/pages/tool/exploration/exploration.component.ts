import { Component, ViewChild, HostListener } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProvenanceService, SessionService } from '../../../shared/_services';
import { AiAssistantPanelComponent } from '../../../components/ai-assistant-panel/ai-assistant-panel.component';
import { ProvenanceVisualizationComponent } from '../../../components/provenance-visualization/provenance-visualization.component';
import { Settings } from '../../../components/brainvis-canvas/utils/settings';

const LS_BOTTOM_HEIGHT = 'storyvis_bottom_height';

@Component({ templateUrl: 'exploration.component.html', styleUrls: ['exploration.component.css'] })
export class ExplorationComponent {
    @ViewChild('aiPanel') aiPanel: AiAssistantPanelComponent;
    @ViewChild('provViz') provViz: ProvenanceVisualizationComponent;

    studyStarted = true;
    IDcreator: string;

    /** True when URL contains ?mode=text-report — routes NoProvGraph study participants. */
    get isNoProvGraph(): boolean {
        return this.route.snapshot.queryParamMap.get('mode') === 'text-report';
    }

    get settings(): Settings { return this.provenance.settings; }

    rightOpen = false;
    activePanel: 'prov' | 'bm' | 'ref' | 'ai' = 'prov';

    bottomOpen = false;
    bottomHeight: number = +(localStorage.getItem(LS_BOTTOM_HEIGHT) ?? 220);

    private _resizing = false;
    private _resizeStartY = 0;
    private _resizeStartH = 0;

    constructor(
        private sessionService: SessionService,
        private provenance: ProvenanceService,
        private route: ActivatedRoute,
    ) {
        this.IDcreator = this.sessionService.getId();
        this.provenance.creatorId = this.IDcreator;
        this.provenance.timeStart = new Date().getTime();
    }

    onResizeStart(event: MouseEvent) {
        event.preventDefault();
        this._resizing = true;
        this._resizeStartY = event.clientY;
        this._resizeStartH = this.bottomHeight;
    }

    @HostListener('window:mousemove', ['$event'])
    onResizeMove(event: MouseEvent) {
        if (!this._resizing) { return; }
        const delta = this._resizeStartY - event.clientY;
        this.bottomHeight = Math.max(80, Math.min(600, this._resizeStartH + delta));
    }

    @HostListener('window:mouseup')
    onResizeEnd() {
        if (!this._resizing) { return; }
        this._resizing = false;
        localStorage.setItem(LS_BOTTOM_HEIGHT, String(this.bottomHeight));
    }

    togglePanel(panel: 'prov' | 'bm' | 'ref' | 'ai') {
        if (this.rightOpen && this.activePanel === panel) {
            this.rightOpen = false;
        } else {
            this.activePanel = panel;
            this.rightOpen = true;
            if (panel === 'prov') {
                // 230ms: CSS transition is 200ms + 30ms buffer for layout settle
                setTimeout(() => { if (this.provViz) { this.provViz.refresh(); } }, 230);
            }
        }
    }
}
