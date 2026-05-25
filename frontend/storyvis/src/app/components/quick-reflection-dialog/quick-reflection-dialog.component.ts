import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ReflectionType, REFLECTION_META } from '../../shared/_services/reflection.service';

export interface QuickReflectionDialogData {
  /** Provenance node id this reflection will be attached to */
  nodeId: string;
  /** Optional pre-fill text (e.g. from a metacognition prompt) */
  prefill?: string;
}

export interface QuickReflectionDialogResult {
  text: string;
  type: ReflectionType;
}

@Component({
  selector: 'app-quick-reflection-dialog',
  templateUrl: './quick-reflection-dialog.component.html',
  styleUrls: ['./quick-reflection-dialog.component.css'],
})
export class QuickReflectionDialogComponent {
  form: FormGroup;
  readonly types: ReflectionType[] = ['observation', 'question', 'hypothesis', 'uncertainty'];
  readonly meta = REFLECTION_META;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<QuickReflectionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: QuickReflectionDialogData,
  ) {
    this.form = this.fb.group({
      type: ['observation'],
      text: [data.prefill || '', [Validators.required, Validators.minLength(3)]],
    });
  }

  get activeMeta() { return this.meta[this.form.value.type as ReflectionType]; }

  submit() {
    if (this.form.invalid) { return; }
    this.dialogRef.close(this.form.value as QuickReflectionDialogResult);
  }
}
