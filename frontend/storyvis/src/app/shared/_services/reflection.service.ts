import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type ReflectionType = 'observation' | 'question' | 'hypothesis' | 'uncertainty';

export interface Reflection {
  id: string;
  nodeId: string;
  text: string;
  type: ReflectionType;
  timestamp: number;
}

export const REFLECTION_META: Record<ReflectionType, { label: string; color: string; icon: string; prompt: string }> = {
  observation: { label: 'Observation',  color: '#4fc3f7', icon: 'visibility',     prompt: 'What do you notice at this state?' },
  question:    { label: 'Question',     color: '#ffb74d', icon: 'help_outline',   prompt: 'What are you unsure about here?' },
  hypothesis:  { label: 'Hypothesis',   color: '#81c784', icon: 'lightbulb',      prompt: 'What might this finding mean?' },
  uncertainty: { label: 'Uncertainty',  color: '#ef9a9a', icon: 'warning_amber',  prompt: 'What is still unclear to you?' },
};

@Injectable({ providedIn: 'root' })
export class ReflectionService {
  private _items: Reflection[] = [];
  reflections$ = new BehaviorSubject<Reflection[]>([]);

  add(nodeId: string, text: string, type: ReflectionType = 'observation'): Reflection {
    const r: Reflection = {
      id: `r-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      nodeId,
      text: text.trim(),
      type,
      timestamp: Date.now(),
    };
    this._items = [...this._items, r];
    this.reflections$.next(this._items);
    return r;
  }

  remove(id: string) {
    this._items = this._items.filter(r => r.id !== id);
    this.reflections$.next(this._items);
  }

  updateText(id: string, text: string) {
    const r = this._items.find(x => x.id === id);
    if (r) { r.text = text.trim(); this.reflections$.next([...this._items]); }
  }

  getForNode(nodeId: string): Reflection[] {
    return this._items.filter(r => r.nodeId === nodeId);
  }

  hasNode(nodeId: string): boolean {
    return this._items.some(r => r.nodeId === nodeId);
  }

  getAll(): Reflection[] { return this._items; }

  reset() { this._items = []; this.reflections$.next([]); }
}
