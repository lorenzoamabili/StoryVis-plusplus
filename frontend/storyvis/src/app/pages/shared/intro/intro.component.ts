import { Component } from '@angular/core';
import { ProvenanceService, SessionService } from '../../../shared/_services';

@Component({ templateUrl: 'intro.component.html' })
export class IntroComponent {
    title = 'intro';
    IDcreator: string;

    constructor(
        private sessionService: SessionService,
        public provenance: ProvenanceService
    ) {
        this.IDcreator = this.sessionService.getId();
    }
}
