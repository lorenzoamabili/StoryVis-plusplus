import { Component } from '@angular/core';
import { trigger, style, animate, transition, state } from '@angular/animations';
import { ProvenanceService } from '../../shared/_services';

@Component({
  selector: 'app-text-report',
  templateUrl: './text-report.component.html',
  styleUrls: ['./text-report.component.css'],
  animations: [
    trigger('textReport', [
      state('open', style({ opacity: 1, height: '*' })),
      state('closed', style({ opacity: 0, height: '0px' })),
      transition('open <=> closed', [animate('300ms ease-in-out')])
    ])
  ]
})
export class TextReportComponent {
  opened: string = 'closed';

  constructor(private provenance: ProvenanceService) {}

  onInput(event: Event) {
    this.provenance.textReport = (event.target as HTMLTextAreaElement).value;
  }

  toggle() {
    this.opened = this.opened === 'open' ? 'closed' : 'open';
  }
}