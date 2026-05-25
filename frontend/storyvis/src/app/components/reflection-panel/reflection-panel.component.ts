import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { Reflection, ReflectionService, ReflectionType, REFLECTION_META } from '../../shared/_services/reflection.service';
import { ProvenanceService } from '../../shared/_services/provenance.service';

@Component({
  selector: 'app-reflection-panel',
  templateUrl: './reflection-panel.component.html',
  styleUrls: ['./reflection-panel.component.css'],
})
export class ReflectionPanelComponent implements OnInit, OnDestroy {
  reflections: Reflection[] = [];
  editingId: string | null = null;
  editText: string = '';

  readonly meta = REFLECTION_META;
  readonly types: ReflectionType[] = ['observation', 'question', 'hypothesis', 'uncertainty'];

  private _sub: Subscription;

  constructor(
    public reflectionService: ReflectionService,
    private provenance: ProvenanceService,
  ) {}

  ngOnInit() {
    this._sub = this.reflectionService.reflections$.subscribe(rs => {
      this.reflections = rs;
    });
  }

  ngOnDestroy() { this._sub?.unsubscribe(); }

  navigateTo(r: Reflection) {
    try { this.provenance.traverser.toStateNode(r.nodeId, 0); } catch (e) {}
  }

  startEdit(r: Reflection) {
    this.editingId = r.id;
    this.editText = r.text;
  }

  commitEdit(r: Reflection) {
    if (this.editText.trim()) {
      this.reflectionService.updateText(r.id, this.editText.trim());
    }
    this.editingId = null;
  }

  remove(r: Reflection) { this.reflectionService.remove(r.id); }

  trackById(_: number, r: Reflection) { return r.id; }

  /** Counts per type for the summary bar */
  countOf(type: ReflectionType): number {
    return this.reflections.filter(r => r.type === type).length;
  }
}
