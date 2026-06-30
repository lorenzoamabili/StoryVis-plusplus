import { Component, ElementRef, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';

import { ProvenanceSlidedeck } from '../../../../../provenance-core';
import { SlideDeckVisualization } from '@visualstorytelling/slide-deck-visualization';
import { ProvenanceService } from '../../shared/_services';

@Component({
  selector: 'app-provenance-slides',
  template: '<div class="slide-deck-root" #deckRoot></div>',
  styleUrls: ['./provenance-slides.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class ProvenanceSlidesComponent implements OnInit {
  @ViewChild('deckRoot', { static: true }) private deckRoot: ElementRef<HTMLDivElement>;

  private _deck: ProvenanceSlidedeck;
  private _deckViz: SlideDeckVisualization;

  constructor(private provenance: ProvenanceService) {}

  get deck(): ProvenanceSlidedeck { return this._deck; }

  ngOnInit() {
    const g = this.provenance.graph;
    if (!g) { return; }
    this._deck = new ProvenanceSlidedeck(g.application, this.provenance.traverser);
    this._deckViz = new SlideDeckVisualization(this._deck, this.deckRoot.nativeElement);
    // Register deck with service so saveStory/saveStoryStudy can access it
    this.provenance.deck = this._deck;
    this.provenance.slideDeck = this._deckViz;
  }
}
