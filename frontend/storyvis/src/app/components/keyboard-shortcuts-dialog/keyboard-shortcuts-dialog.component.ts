import { Component } from '@angular/core';

interface Shortcut {
  keys: string[];
  description: string;
  group: string;
}

@Component({
  selector: 'app-keyboard-shortcuts-dialog',
  template: `
    <h2 mat-dialog-title class="ks-title">
      <mat-icon class="ks-icon">keyboard</mat-icon>
      Keyboard Shortcuts
    </h2>

    <mat-dialog-content class="ks-body">
      <ng-container *ngFor="let group of groups">
        <div class="ks-group-label">{{ group }}</div>
        <div class="ks-row" *ngFor="let s of byGroup(group)">
          <span class="ks-desc">{{ s.description }}</span>
          <span class="ks-keys">
            <kbd *ngFor="let k of s.keys; let last=last">{{ k }}</kbd>
          </span>
        </div>
      </ng-container>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Close</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .ks-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 15px;
      font-weight: 700;
      color: rgba(255,255,255,0.9);
      margin: 0 0 4px;
    }
    .ks-icon { color: rgb(255,200,100); font-size: 20px; width: 20px; height: 20px; line-height: 20px; }
    .ks-body { padding: 4px 0 8px; min-width: 360px; max-width: 480px; }
    .ks-group-label {
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: rgba(255,255,255,0.3);
      padding: 14px 0 4px;
      border-bottom: 1px solid rgba(255,255,255,0.08);
      margin-bottom: 6px;
    }
    .ks-group-label:first-child { padding-top: 2px; }
    .ks-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 4px 0;
      gap: 16px;
    }
    .ks-desc { font-size: 13px; color: rgba(255,255,255,0.75); }
    .ks-keys { display: flex; gap: 4px; flex-shrink: 0; }
    kbd {
      background: rgba(255,255,255,0.1);
      border: 1px solid rgba(255,255,255,0.2);
      border-bottom-width: 2px;
      border-radius: 4px;
      padding: 2px 7px;
      font-family: monospace;
      font-size: 11px;
      color: rgba(255,255,255,0.85);
      white-space: nowrap;
    }
  `]
})
export class KeyboardShortcutsDialogComponent {
  readonly shortcuts: Shortcut[] = [
    // Navigation
    { group: 'Navigation', keys: ['Scroll'],      description: 'Scroll slices (hover a 2D panel)' },
    { group: 'Navigation', keys: ['Ctrl', 'Z'],   description: 'Undo last action' },
    { group: 'Navigation', keys: ['Ctrl', 'Y'],   description: 'Redo action' },
    // Annotation & notes
    { group: 'Annotation & Notes', keys: ['B'],   description: 'Quick bookmark current state' },
    { group: 'Annotation & Notes', keys: ['R'],   description: 'Open reflection dialog' },
    // Measurement tools
    { group: 'Measurement Tools', keys: ['Alt', 'Click'], description: 'Add frame to Data-Comics (when open)' },
    // Dialogs
    { group: 'Dialogs', keys: ['Ctrl', 'Enter'],  description: 'Submit annotation / reflection (in dialog)' },
    { group: 'Dialogs', keys: ['Esc'],             description: 'Cancel / close dialog' },
    { group: 'Dialogs', keys: ['?'],               description: 'Open this shortcut reference' },
  ];

  get groups(): string[] {
    return [...new Set(this.shortcuts.map(s => s.group))];
  }

  byGroup(group: string): Shortcut[] {
    return this.shortcuts.filter(s => s.group === group);
  }
}
