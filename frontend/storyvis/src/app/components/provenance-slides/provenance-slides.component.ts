import { Component, ElementRef, OnInit, OnDestroy, ViewChild, ViewEncapsulation } from '@angular/core';
import { Subscription } from 'rxjs';

import { ProvenanceSlidedeck } from '../../../../../provenance-core';
import { SlideDeckVisualization } from '@visualstorytelling/slide-deck-visualization';
import { ProvenanceService } from '../../shared/_services';
import { storyVisBridge } from '@visualstorytelling/provenance-tree-visualization';

@Component({
  selector: 'app-provenance-slides',
  template: '<div id="slideDeck" class="slide-deck-root" #deckRoot></div>',
  styleUrls: ['./provenance-slides.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class ProvenanceSlidesComponent implements OnInit, OnDestroy {
  @ViewChild('deckRoot', { static: true }) private deckRoot: ElementRef<HTMLDivElement>;

  private _deck: ProvenanceSlidedeck;
  private _deckViz: SlideDeckVisualization;
  private _resetSub: Subscription;

  constructor(private provenance: ProvenanceService) {}

  get deck(): ProvenanceSlidedeck { return this._deck; }

  ngOnInit() {
    this._initDeck();
    this._resetSub = this.provenance.graphReset$.subscribe(() => this._initDeck());
  }

  ngOnDestroy() {
    this._resetSub?.unsubscribe();
  }

  private _initDeck() {
    const g = this.provenance.graph;
    if (!g) { return; }
    // Clear previous deck visualization from DOM
    if (this.deckRoot?.nativeElement) {
      this.deckRoot.nativeElement.innerHTML = '';
    }
    this._deck = new ProvenanceSlidedeck(g.application, this.provenance.traverser);
    this._deckViz = new SlideDeckVisualization(this._deck, this.deckRoot.nativeElement);
    this.provenance.deck = this._deck;
    this.provenance.slideDeck = this._deckViz;
    storyVisBridge.slideDeck = this._deckViz;
  }
}
