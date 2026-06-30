import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface SliceState {
  axial: number;
  coronal: number;
  sagittal: number;
}

/** Lightweight bus: canvas writes, AI service reads. No circular dep. */
@Injectable({ providedIn: 'root' })
export class SessionStateService {
  readonly datasetName$ = new BehaviorSubject<string>('Chest CT 1');
  readonly slices$ = new BehaviorSubject<SliceState>({ axial: 0, coronal: 0, sagittal: 0 });
  readonly windowLevel$ = new BehaviorSubject<{ w: number; c: number }>({ w: 350, c: 50 });

  setDataset(name: string) { this.datasetName$.next(name); }

  setSlices(s: Partial<SliceState>) {
    this.slices$.next({ ...this.slices$.value, ...s });
  }

  setWindowLevel(w: number, c: number) { this.windowLevel$.next({ w, c }); }

  get snapshot() {
    return {
      dataset:     this.datasetName$.value,
      slices:      this.slices$.value,
      windowLevel: this.windowLevel$.value,
    };
  }
}
