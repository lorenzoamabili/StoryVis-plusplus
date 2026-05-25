import { Component, Input, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { AiAssistantService, ChatMessage, FrameMeta, SlideMeta } from '../../shared/_services/ai-assistant.service';
import { ComparisonComponent } from '../brainvis-canvas/comparison.component';
import { ProvenanceSlidesComponent } from '../provenance-slides/provenance-slides.component';

@Component({
  selector: 'app-ai-assistant-panel',
  templateUrl: './ai-assistant-panel.component.html',
  styleUrls: ['./ai-assistant-panel.component.css'],
})
export class AiAssistantPanelComponent implements OnInit, OnDestroy {
  /** Optional: data-comics component so the AI can read captured frames. */
  @Input() comparisonCanvas: ComparisonComponent;
  /** Optional: story-deck component so the AI can read slide metadata. */
  @Input() slidesComponent: ProvenanceSlidesComponent;

  @ViewChild('chatEnd') chatEnd: ElementRef;

  history: ChatMessage[] = [];
  loading = false;
  userInput = '';

  /** Tab: 'session' | 'report' | 'story' */
  activeTab: 'session' | 'report' | 'story' = 'session';

  copied = false;

  private _historySub: Subscription;
  private _loadingSub: Subscription;

  constructor(public ai: AiAssistantService) {}

  ngOnInit() {
    this._historySub = this.ai.history$.subscribe(h => {
      this.history = h;
      setTimeout(() => this.chatEnd?.nativeElement?.scrollIntoView({ behavior: 'smooth' }), 50);
    });
    this._loadingSub = this.ai.loading$.subscribe(v => this.loading = v);
  }

  ngOnDestroy() {
    this._historySub?.unsubscribe();
    this._loadingSub?.unsubscribe();
  }

  // ── Quick actions ─────────────────────────────────────────────────────────

  analyzeSession() {
    this.activeTab = 'session';
    this.ai.analyzeSession().subscribe();
  }

  generateReport() {
    this.activeTab = 'report';
    const frames = this._getFramesMeta();
    this.ai.suggestReport(frames).subscribe();
  }

  suggestStory() {
    this.activeTab = 'story';
    const slides = this._getSlidesMeta();
    this.ai.suggestStorySlides(slides).subscribe();
  }

  // ── Chat ──────────────────────────────────────────────────────────────────

  send() {
    const text = this.userInput.trim();
    if (!text || this.loading) { return; }
    this.userInput = '';
    this.ai.send(text).subscribe();
  }

  clearChat() { this.ai.clearHistory(); }

  copyLast() {
    const last = [...this.history].reverse().find(m => m.role === 'assistant');
    if (!last) { return; }
    navigator.clipboard.writeText(last.content).then(() => {
      this.copied = true;
      setTimeout(() => this.copied = false, 2000);
    });
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  private _getFramesMeta(): FrameMeta[] {
    if (!this.comparisonCanvas) { return []; }
    return (this.comparisonCanvas as any).getFramesMeta?.() ?? [];
  }

  private _getSlidesMeta(): SlideMeta[] {
    if (!this.slidesComponent?._deck) { return []; }
    try {
      const slides: any[] = (this.slidesComponent._deck as any).slides || [];
      return slides.map(s => ({
        title:      s.name || s.label || '(untitled)',
        annotation: s.notes || s.annotation || undefined,
      }));
    } catch (_) { return []; }
  }

  trackByIdx(i: number) { return i; }
}
