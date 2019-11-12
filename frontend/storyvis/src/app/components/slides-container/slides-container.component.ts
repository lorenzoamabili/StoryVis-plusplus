import { Component, OnInit, Input } from '@angular/core';
import { trigger, style, animate, transition, state } from '@angular/animations';

@Component({
  selector: 'app-slides-container',
  templateUrl: './slides-container.component.html',
  styleUrls: ['./slides-container.component.css'],
  animations: [
    trigger('slideContainer', [
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

export class SlidesContainerComponent implements OnInit {
  @Input() opened = false;

  ngOnInit() {
  }

  toggleBottomDrawer() {
    this.opened = !this.opened;
  }
}
