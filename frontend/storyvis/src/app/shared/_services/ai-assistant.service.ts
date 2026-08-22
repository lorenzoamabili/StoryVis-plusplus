import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { map, timeout, catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { BookmarkService } from './bookmark.service';
import { ReflectionService } from './reflection.service';
import { CoverageService } from './coverage.service';
import { ProvenanceService } from './provenance.service';
import { SessionStateService } from './session-state.service';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  /** Which quick-action produced this message, if any — used to label it in the transcript. */
  tag?: 'session' | 'report' | 'story';
}

export interface FrameMeta {
  panel: string;
  slice: number | string;
  wl: string;
}

export interface SlideMeta {
  title: string;
  annotation?: string;
}

@Injectable({ providedIn: 'root' })
export class AiAssistantService {
  private readonly _chatUrl = `${environment.apiUrl}/ai/chat`;

  /** Chat history for the current session. */
  history$ = new BehaviorSubject<ChatMessage[]>([]);
  loading$ = new BehaviorSubject<boolean>(false);

  constructor(
    private http: HttpClient,
    private bookmarkService: BookmarkService,
    private reflectionService: ReflectionService,
    private coverageService: CoverageService,
    private provenance: ProvenanceService,
    private sessionState: SessionStateService,
  ) {}

  // ── Public API ────────────────────────────────────────────────────────────

  /** Send a message, appending it to the history. Returns the assistant reply. */
  send(userText: string, extraContext: Partial<SessionContext> = {}, tag?: ChatMessage['tag']): Observable<string> {
    const userMsg: ChatMessage = tag ? { role: 'user', content: userText, tag } : { role: 'user', content: userText };
    const current = this.history$.value;
    this.history$.next([...current, userMsg]);
    this.loading$.next(true);

    const context = { ...this._buildBaseContext(), ...extraContext };
    const messages = this.history$.value.map(m => ({ role: m.role, content: m.content }));

    return this.http.post<{ content: string }>(this._chatUrl, { messages, context }).pipe(
      timeout(30000),
      map(res => {
        const reply: ChatMessage = { role: 'assistant', content: res.content };
        this.history$.next([...this.history$.value, reply]);
        this.loading$.next(false);
        return res.content;
      }),
      catchError(err => {
        console.error('[AiAssistantService] chat request failed:', err);
        const msg = err.name === 'TimeoutError'
          ? "The AI assistant isn't responding right now — try again in a moment."
          : 'Something went wrong generating a response. Please try again.';
        const errReply: ChatMessage = { role: 'assistant', content: `⚠ ${msg}` };
        this.history$.next([...this.history$.value, errReply]);
        this.loading$.next(false);
        return throwError(err);
      }),
    );
  }

  clearHistory() { this.history$.next([]); }

  // ── Context builders ──────────────────────────────────────────────────────

  private _buildBaseContext(): SessionContext {
    const bookmarks = this.bookmarkService.getAll();
    const reflections = this.reflectionService.getAll();
    const { dataset, slices, windowLevel } = this.sessionState.snapshot;

    const currentNode: any = this.provenance.graph?.current;
    const currentNodeLabel = currentNode?.label
      || currentNode?.action?.metadata?.label
      || currentNode?.action?.do
      || undefined;
    const nodeCount = Object.keys((this.provenance.graph as any)?.nodes || {}).length;
    const slideCount = (this.provenance.deck as any)?.slides?.length ?? 0;

    return {
      dataset,
      currentSlices: slices,
      windowLevel,
      currentNode: currentNodeLabel,
      nodeCount,
      slideCount,
      coverage: {
        axial:    this.coverageService.getCoveragePercent('axial'),
        coronal:  this.coverageService.getCoveragePercent('coronal'),
        sagittal: this.coverageService.getCoveragePercent('sagittal'),
        axialCount: this.coverageService.getVisitedCount('axial'),
        axialMax:   this.coverageService.getMax('axial'),
      },
      phases: bookmarks.filter(b => b.isPhase).map(b => ({
        label: b.label,
        time:  new Date(b.timestamp).toLocaleTimeString(),
      })),
      bookmarks: bookmarks.filter(b => !b.isPhase).map(b => ({
        label:   b.label,
        isPhase: false,
        time:    new Date(b.timestamp).toLocaleTimeString(),
      })),
      reflections: reflections.map(r => ({
        type: r.type,
        text: r.text,
        time: new Date(r.timestamp).toLocaleTimeString(),
      })),
      provenancePath: this._extractProvenancePath(),
    };
  }

  /** Walk the provenance graph from root → current and collect action labels. */
  private _extractProvenancePath(): string[] {
    const g = this.provenance.graph;
    if (!g || !g.current) { return []; }
    const path: string[] = [];
    const collect = (node: any, depth = 0) => {
      if (!node || depth > 200) { return; }
      const label = node.label || node.action?.do?.name || node.id;
      if (label) { path.push(label); }
      (node.children || []).forEach((c: any) => collect(c, depth + 1));
    };
    try { collect((g as any).root || g.current); } catch (_) {}
    return path;
  }

  // ── Pre-built prompt helpers (called by the panel's quick-action buttons) ─

  analyzeSession(): Observable<string> {
    return this.send(
      'Analyse my exploration session so far. Summarise what I examined, highlight any coverage blind spots, and identify patterns in my reflections. Be brief and educational.',
      {},
      'session'
    );
  }

  suggestReport(frames: FrameMeta[]): Observable<string> {
    const frameList = frames.length
      ? frames.map((f, i) => `Frame ${i + 1}: ${f.panel} · slice ${f.slice} · W/L ${f.wl}`).join('\n')
      : '(no frames captured yet)';
    return this.send(
      `Based on my session, generate a structured visual report for the Data-Comics editor.\n\nCaptured frames:\n${frameList}\n\nProvide:\n1. A concise caption for each frame (format: "Frame N – [panel] – [description]")\n2. A one-paragraph Findings summary\n3. A one-sentence Impression`,
      { frames },
      'report'
    );
  }

  suggestStorySlides(slides: SlideMeta[]): Observable<string> {
    const slideList = slides.length
      ? slides.map((s, i) => `Slide ${i + 1}: "${s.title}"${s.annotation ? ' — ' + s.annotation : ''}`).join('\n')
      : '(no slides in story deck yet)';
    return this.send(
      `Help me improve the narrative for my story deck.\n\nCurrent slides:\n${slideList}\n\nSuggest concise, clinically-oriented titles and short annotations for each slide. Also propose a logical ordering if the current sequence could be improved.`,
      { slides },
      'story'
    );
  }

  generateSingleCaption(frame: FrameMeta): Observable<string> {
    return this.send(
      `Generate a single concise caption for this imaging frame:\n${frame.panel} view · slice ${frame.slice} · W/L ${frame.wl}\nFormat: "[panel] – [brief clinical description]". Keep it under 15 words.`,
      { frames: [frame] }
    );
  }
}

interface SessionContext {
  dataset?: string;
  currentSlices?: { axial: number; coronal: number; sagittal: number };
  windowLevel?: { w: number; c: number };
  coverage?: { axial: number; coronal: number; sagittal: number; axialCount?: number; axialMax?: number };
  phases?: { label: string; time: string }[];
  bookmarks?: { label: string; isPhase: boolean; time: string }[];
  reflections?: { type: string; text: string; time: string }[];
  frames?: FrameMeta[];
  slides?: SlideMeta[];
  provenancePath?: string[];
  currentNode?: string;
  nodeCount?: number;
  slideCount?: number;
}
