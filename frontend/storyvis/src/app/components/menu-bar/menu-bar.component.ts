import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { first } from 'rxjs/operators';
import { BrainvisCanvasComponent } from '../brainvis-canvas/brainvis-canvas.component';
import { ProvenanceService, UserService, SessionService } from '../../shared/_services';
import { Provenance, Story, TextReport } from '../../shared/_models';
import { MatSelectChange } from '@angular/material/select';
import { MatDialog } from '@angular/material/dialog';
import { Settings } from '../brainvis-canvas/utils/settings';
import { TutorialService } from '../tutorial/tutorial.service';
import { BookmarkService } from '../../shared/_services/bookmark.service';
import { BookmarkLabelDialogComponent } from '../bookmark-label-dialog/bookmark-label-dialog.component';
import { SessionStateService } from '../../shared/_services/session-state.service';
import { KeyboardShortcutsDialogComponent } from '../keyboard-shortcuts-dialog/keyboard-shortcuts-dialog.component';

@Component({
  selector: 'app-menu-bar',
  templateUrl: './menu-bar.component.html',
  styleUrls: ['./menu-bar.component.css']
})
export class MenuBarComponent implements OnInit, OnDestroy {
  @Input() canvas: BrainvisCanvasComponent;
  @Input() canvasComparison: any;
  @Input() IDcreator: string;
  @Input() studyStarted: boolean;
  public now: string;
  public settings = Settings.getInstance(this);
  private _clockInterval: any;

  graphs: Provenance[] = [];
  stories: Story[] = [];
  textReports: TextReport[] = [];

  public dataSources = [
    { name: 'Chest CT 1', url: 'https://rawcdn.githack.com/lorenzoamabili/DICOMdata/1596c8cf93a5505166375daf67c9d450e0f3bbda/data/prova1.nii.gz' },
    { name: 'Brain MRI', url: 'https://rawcdn.githack.com/VisualStorytelling/data/94dd382a51958824eb6bf4cf529f5b7bce383f99/fnndsc/adi_brain.nii.gz' },
    { name: 'Custom URL…', url: '__custom__' }
  ];

  public selectedDataUrl: string = this.dataSources[0].url;
  public customUrl: string = '';
  public showCustomInput: boolean = false;
  public saving = false;

  constructor(
    public userService: UserService,
    public provenance: ProvenanceService,
    public sessionService: SessionService,
    public tutorialService: TutorialService,
    public bookmarkService: BookmarkService,
    private dialog: MatDialog,
    private sessionState: SessionStateService,
  ) {
    const id = this.sessionService.getId();
    this.userService.getAllGraphs(id).pipe(first()).subscribe(
      graphs => { this.graphs = graphs; },
      err => { console.warn('getAllGraphs failed', err); }
    );
    this.userService.getAllStories(id).pipe(first()).subscribe(
      stories => { this.stories = stories; },
      err => { console.warn('getAllStories failed', err); }
    );
    this.userService.getAllTextReports(id).pipe(first()).subscribe(
      textReports => { this.textReports = textReports; },
      err => { console.warn('getAllTextReports failed', err); }
    );
  }

  load() {
    const id = this.sessionService.getId();
    this.userService.getAllGraphs(id).pipe(first()).subscribe(
      graphs => { this.graphs = graphs; },
      err => { console.warn('getAllGraphs failed', err); }
    );
  }

  onDataSourceChange(change: MatSelectChange) {
    const url: string = change.value;
    if (url === '__custom__') {
      this.showCustomInput = true;
    } else {
      this.showCustomInput = false;
      const ds = this.dataSources.find(d => d.url === url);
      if (ds) { this.sessionState.setDataset(ds.name); }
      if (this.canvas) { this.canvas.loadData(url); }
    }
  }

  loadCustomUrl() {
    const url = this.customUrl.trim();
    if (url && this.canvas) {
      this.canvas.loadData(url);
      this.showCustomInput = false;
    }
  }

  public wlSettings = [
    { name: 'head - brain', width: '80', center: '40' },
    { name: 'head - subdural', width: '200', center: '100' },
    { name: 'head - stroke', width: '40', center: '40' },
    { name: 'head - temporal bones', width: '2800', center: '600' },
    { name: 'head - soft tissues', width: '400', center: '60' },
    { name: 'chest - lungs', width: '1500', center: '600' },
    { name: 'chest - mediastinum', width: '350', center: '50' },
    { name: 'abdomen - liver', width: '400', center: '50' },
    { name: 'abdomen - soft tissues', width: '150', center: '30' },
    { name: 'spine - bone', width: '250', center: '50' },
    { name: 'spine - soft tissues', width: '1800', center: '400' }
  ];

  ngOnInit() {
    const numFormat = (i: number) => ('0' + i).slice(-2);
    this._clockInterval = setInterval(() => {
      const date = new Date();
      this.now = `${numFormat(date.getHours())}:${numFormat(date.getMinutes())}`;
    }, 1000);
  }

  ngOnDestroy() {
    clearInterval(this._clockInterval);
  }

  startTutorial() { this.tutorialService.startMain(); }

  openShortcuts() {
    this.dialog.open(KeyboardShortcutsDialogComponent, { width: '520px', autoFocus: false });
  }

  bookmarkCurrent(isPhase = false) {
    const g = this.provenance.graph;
    if (!g || !g.current) { return; }
    const nodeId = (g.current as any).id;
    if (!nodeId) { return; }
    const count = this.bookmarkService.getAll();
    const defaultLabel = isPhase
      ? `Phase ${count.filter(b => b.isPhase).length + 1}`
      : `State ${count.length + 1}`;
    this.dialog.open(BookmarkLabelDialogComponent, {
      data: { isPhase, defaultLabel },
      width: '360px',
      autoFocus: true,
    }).afterClosed().subscribe(label => {
      if (label) { this.bookmarkService.add(nodeId, label, isPhase); }
    });
  }

  saveSession() {
    const id = this.IDcreator;
    this.saving = true;
    this.provenance.saveGraphStudy(id as any);
    this.provenance.saveStoryStudy(id as any);
    this.provenance.saveTextReportStudy(id as any);
    setTimeout(() => this.saving = false, 1500);
  }
}
