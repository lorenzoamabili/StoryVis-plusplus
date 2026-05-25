import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { BookmarkService, Bookmark } from '../../shared/_services/bookmark.service';
import { ProvenanceService } from '../../shared/_services/provenance.service';

@Component({
  selector: 'app-bookmark-panel',
  templateUrl: './bookmark-panel.component.html',
  styleUrls: ['./bookmark-panel.component.css']
})
export class BookmarkPanelComponent implements OnInit, OnDestroy {
  bookmarks: Bookmark[] = [];
  editingId: string | null = null;
  editLabel: string = '';

  /** nodeId of the currently active provenance state */
  get currentNodeId(): string | null {
    const g = this.provenance.graph;
    return g && g.current ? (g.current as any).id || null : null;
  }

  private _sub: Subscription;

  constructor(public bookmarkService: BookmarkService, private provenance: ProvenanceService) {}

  ngOnInit() {
    this._sub = this.bookmarkService.bookmarks$.subscribe(bms => {
      this.bookmarks = bms;
    });
  }

  ngOnDestroy() {
    this._sub?.unsubscribe();
  }

  navigateTo(bm: Bookmark) {
    try {
      this.provenance.traverser.toStateNode(bm.nodeId, 0);
    } catch (e) {
      console.warn('Bookmark navigation failed:', e);
    }
  }

  startEdit(bm: Bookmark) {
    this.editingId = bm.id;
    this.editLabel = bm.label;
  }

  commitEdit(bm: Bookmark) {
    if (this.editLabel.trim()) {
      this.bookmarkService.updateLabel(bm.id, this.editLabel.trim());
    }
    this.editingId = null;
  }

  remove(bm: Bookmark) {
    this.bookmarkService.remove(bm.id);
  }

  trackById(_: number, bm: Bookmark) { return bm.id; }
}
