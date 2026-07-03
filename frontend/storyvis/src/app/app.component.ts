import { Component } from '@angular/core';
import { ProvenanceService } from './shared/_services';

@Component({
    selector: 'app',
    templateUrl: './app.component.html'
})
export class AppComponent {
    title = 'app';
    constructor(public provenance: ProvenanceService) {}
}