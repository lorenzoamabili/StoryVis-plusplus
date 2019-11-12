import { Component, OnInit, Input } from '@angular/core';
import { trigger, style, animate, transition, state } from '@angular/animations';

@Component({
  selector: 'app-text-report',
  templateUrl: './text-report.component.html',
  styleUrls: ['./text-report.component.css'],
  animations: [
    trigger('textReport', [
      state('true', style({
        transform: 'translateX(0)'      
      })),
      state('false', style({
        transform: 'translateX(-100%)'      
      })),
      transition('0 <=> 1', animate(100)),
    ])
  ]
})

export class TextReportComponent implements OnInit {
  @Input() opened = false;

  constructor() {
  }

  ngOnInit() {
  }

  toggleBottomDrawer() {
    this.opened = !this.opened;
  }
}
