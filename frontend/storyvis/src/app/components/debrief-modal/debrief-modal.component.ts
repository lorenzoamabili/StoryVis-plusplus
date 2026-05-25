import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ProvenanceService } from '../../shared/_services/provenance.service';
import { CoverageService } from '../../shared/_services/coverage.service';

export interface DebriefData {
  provenance: ProvenanceService;
  coverage: CoverageService;
}

@Component({
  selector: 'app-debrief-modal',
  templateUrl: './debrief-modal.component.html',
  styleUrls: ['./debrief-modal.component.css']
})
export class DebriefModalComponent {
  form: FormGroup;
  saved = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: DebriefData,
    private dialogRef: MatDialogRef<DebriefModalComponent>,
    private fb: FormBuilder
  ) {
    this.form = this.fb.group({
      findings: [''],
      wouldRevisit: [''],
      uncertain: [''],
      confidence: [3]
    });
  }

  get axialPct()   { return this.data.coverage?.getCoveragePercent('axial')   ?? 0; }
  get coronalPct() { return this.data.coverage?.getCoveragePercent('coronal') ?? 0; }
  get sagittalPct(){ return this.data.coverage?.getCoveragePercent('sagittal')?? 0; }
  get lowCoverage(){ return this.axialPct < 40 || this.coronalPct < 40 || this.sagittalPct < 40; }

  coverageColor(pct: number): string {
    return pct < 40 ? 'warn' : pct < 70 ? 'accent' : 'primary';
  }

  submit() {
    const report = {
      timestamp: new Date().toISOString(),
      findings:    this.form.value.findings,
      wouldRevisit: this.form.value.wouldRevisit,
      uncertain:   this.form.value.uncertain,
      confidence:  this.form.value.confidence,
      coverage: {
        axial:    this.axialPct,
        coronal:  this.coronalPct,
        sagittal: this.sagittalPct
      }
    };
    this.saved = true;
    // Persist alongside provenance if a text-report save method is wired:
    try { this.data.provenance.textReport = JSON.stringify(report); } catch (_) {}
    setTimeout(() => this.dialogRef.close(report), 600);
  }

  close() { this.dialogRef.close(null); }
}
