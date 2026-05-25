import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { TutorialService } from './tutorial.service';

const CENTER_STYLE = { top: '50%', left: '50%', transform: 'translate(-50%,-50%)' };

@Component({
  selector: 'app-tutorial',
  templateUrl: './tutorial.component.html',
  styleUrls: ['./tutorial.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TutorialComponent implements OnInit, OnDestroy {
  highlight: { top: number; left: number; width: number; height: number } | null = null;
  cardStyle: { [key: string]: string } = CENTER_STYLE;

  private sub: Subscription;

  constructor(public tutorial: TutorialService, private cd: ChangeDetectorRef) {}

  ngOnInit() {
    // Defer one tick so the DOM reflects the new step before reading element bounds
    this.sub = this.tutorial.idx$.subscribe(() =>
      setTimeout(() => { this.refresh(); this.cd.markForCheck(); }, 0)
    );
  }

  ngOnDestroy() { this.sub.unsubscribe(); }

  private refresh() {
    if (!this.tutorial.active) { this.highlight = null; return; }

    const step = this.tutorial.current;
    const el = step.targetId ? document.getElementById(step.targetId) : null;

    if (!el || step.position === 'center') {
      this.highlight = null;
      this.cardStyle = CENTER_STYLE;
      return;
    }

    const r = el.getBoundingClientRect();

    // Element is not visible — zero-size (*ngIf=false) or translated off-screen
    // (Angular Material side-mode sidenav closed still renders content off-screen).
    const inViewport = r.width > 0 && r.right > 0 && r.left < window.innerWidth
                                    && r.bottom > 0 && r.top < window.innerHeight;
    if (!inViewport) {
      this.highlight = null;
      this.cardStyle = CENTER_STYLE;
      return;
    }

    const P = 6, M = 14, W = 340, CARD_H = 400, vw = window.innerWidth, vh = window.innerHeight;

    this.highlight = { top: r.top - P, left: r.left - P, width: r.width + P * 2, height: r.height + P * 2 };

    let top: number, left: number;
    switch (step.position) {
      case 'right': top = r.top;          left = r.right + M;              break;
      case 'left':  top = r.top;          left = r.left - W - M;           break;
      case 'top':   top = r.top - 220 - M; left = r.left + r.width/2 - W/2; break;
      default:      top = r.bottom + M;   left = r.left + r.width/2 - W/2;  // bottom
    }

    this.cardStyle = {
      top:  Math.max(8, Math.min(top,  vh - CARD_H)) + 'px',
      left: Math.max(8, Math.min(left, vw - W - 8)) + 'px'
    };
  }
}
