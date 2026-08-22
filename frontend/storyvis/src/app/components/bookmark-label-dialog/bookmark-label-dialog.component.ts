import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface BookmarkLabelData {
  isPhase: boolean;
  defaultLabel: string;
}

@Component({
  selector: 'app-bookmark-label-dialog',
  templateUrl: './bookmark-label-dialog.component.html',
  styles: [`
    .bld-title { display: flex; align-items: center; gap: 8px; color: #e0e0e0; font-size: 16px; margin: 0 0 4px; }
    .bld-icon { color: rgb(255,200,100); font-size: 20px; width: 20px; height: 20px; line-height: 20px; }
    .bld-field { width: 100%; min-width: min(320px, 85vw); }
    .bld-hint { font-size: 12px; color: rgba(224,224,224,0.75); margin: 0 0 12px; line-height: 1.5; }
    mat-dialog-content { padding-top: 8px !important; }
  `]
})
export class BookmarkLabelDialogComponent {
  label: string;

  constructor(
    public dialogRef: MatDialogRef<BookmarkLabelDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: BookmarkLabelData
  ) {
    this.label = data.defaultLabel;
  }

  submit() {
    const trimmed = this.label.trim();
    if (trimmed) { this.dialogRef.close(trimmed); }
  }
}
