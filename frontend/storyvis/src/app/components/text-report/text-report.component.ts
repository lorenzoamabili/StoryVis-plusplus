import { Component, Input } from '@angular/core';
import { trigger, style, animate, transition, state } from '@angular/animations';

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

  toggle() {
    this.opened = this.opened === 'open' ? 'closed' : 'open';
  }
}