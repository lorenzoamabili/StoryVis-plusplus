import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-annotation-dialog',
  template: `
    <h2 mat-dialog-title class="ad-title">
      <mat-icon class="ad-icon">speaker_notes</mat-icon>
      Add Annotation
    </h2>
    <mat-dialog-content class="ad-body">
      <mat-form-field appearance="outline" class="ad-field">
        <mat-label>Annotation text</mat-label>
        <textarea matInput [(ngModel)]="text" rows="3" cdkFocusInitial
                  placeholder="Describe what you observe at this location…"
                  (keydown.control.enter)="submit()"></textarea>
      </mat-form-field>
      <p class="ad-hint">Ctrl+Enter to place · Esc to cancel</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end" class="ad-actions">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-flat-button class="ad-place-btn"
              (click)="submit()" [disabled]="!text.trim()">
        Place
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    :host { display: block; }
    .ad-title {
      display: flex; align-items: center; gap: 8px;
      color: #e0e0e0; font-size: 16px; margin: 0 0 4px;
    }
    .ad-icon { color: rgb(255,200,100); font-size: 20px; width: 20px; height: 20px; line-height: 20px; }
    .ad-body { padding: 8px 24px 4px !important; }
    .ad-field { width: min(380px, 85vw); }
    .ad-field textarea { color: #e0e0e0; background: transparent; resize: none; }
    .ad-hint { font-size: 11px; color: rgba(255,255,255,0.3); margin: 2px 0 0; font-style: italic; }
    .ad-actions { padding: 8px 16px 16px !important; }
    .ad-place-btn {
      background: rgb(255,200,100) !important;
      color: #1a1a2e !important;
      font-weight: 700;
      min-width: 72px;
    }
    .ad-place-btn[disabled] { opacity: 0.4; }
  `]
})
export class AnnotationDialogComponent {
  text = '';

  constructor(private dialogRef: MatDialogRef<AnnotationDialogComponent>) {}

  submit() {
    if (this.text.trim()) { this.dialogRef.close(this.text.trim()); }
  }
}
