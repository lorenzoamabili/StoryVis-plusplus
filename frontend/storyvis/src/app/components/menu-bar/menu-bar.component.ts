import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { first } from 'rxjs/operators';
import { BrainvisCanvasComponent } from '../brainvis-canvas/brainvis-canvas.component';
import { ProvenanceService, UserService, AuthenticationService } from '../../shared/_services';
import { Role, Provenance, Story, TextReport, User } from '../../shared/_models';
import { MatSelectChange } from '@angular/material/select';
import { Router } from '@angular/router';
import { Settings } from '../brainvis-canvas/utils/settings';
import { TutorialService } from '../tutorial/tutorial.service';
import { BookmarkService } from '../../shared/_services/bookmark.service';

@Component({
  selector: 'app-menu-bar',
  templateUrl: './menu-bar.component.html',
  styleUrls: ['./menu-bar.component.css']
})
export class MenuBarComponent implements OnInit, OnDestroy {
  @Input() canvas: BrainvisCanvasComponent;
  @Input() canvasComparison: any;
  @Input() IDcreator: number;
  @Input() studyStarted: boolean;
  public now: string;
  public settings = Settings.getInstance(this);
  private _clockInterval: any;

  currentUser: User;
  graphs: Provenance[] = [];
  stories: Story[] = [];
  textReports: TextReport[] = [];

  constructor(
    public userService: UserService,
    public provenance: ProvenanceService,
    public router: Router,
    public authenticationService: AuthenticationService,
    public tutorialService: TutorialService,
    public bookmarkService: BookmarkService
  ) {

    this.userService.getAllGraphs().pipe(first()).subscribe(
      graphs => { this.graphs = graphs; },
      err => { console.warn('getAllGraphs failed', err); }
    );
    this.userService.getAllStories().pipe(first()).subscribe(
      stories => { this.stories = stories; },
      err => { console.warn('getAllStories failed', err); }
    );
    this.userService.getAllTextReports().pipe(first()).subscribe(
      textReports => { this.textReports = textReports; },
      err => { console.warn('getAllTextReports failed', err); }
    );
  }

  reset(){
    this.graphs = [];
  }

  load(){
    this.userService.getAllGraphs().pipe(first()).subscribe(
      graphs => { this.graphs = graphs; },
      err => { console.warn('getAllGraphs failed', err); }
    );
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

  // public dataSources = [{ name: 'Study Data', url: 'https://rawcdn.githack.com/lorenzoamabili/DICOMdata/1596c8cf93a5505166375daf67c9d450e0f3bbda/data/prova1.nii.gz' },
  // { name: 'Practice Data', url: 'https://rawcdn.githack.com/VisualStorytelling/data/94dd382a51958824eb6bf4cf529f5b7bce383f99/fnndsc/adi_brain.nii.gz' }];

  public dataSources = [
    { name: 'brain', url: 'https://rawcdn.githack.com/VisualStorytelling/data/94dd382a51958824eb6bf4cf529f5b7bce383f99/fnndsc/adi_brain.nii.gz' },
    { name: 'chest1', url: 'https://rawcdn.githack.com/lorenzoamabili/DICOMdata/1596c8cf93a5505166375daf67c9d450e0f3bbda/data/prova1.nii.gz' },
    { name: 'chest2', url: 'https://glcdn.githack.com/lorenzo.amabili/dicomdatalab/raw/master/data/prova1.nii.gz' }
  ];

  // public setDataSource(change: MatSelectChange) {
  //   // this.canvas.loadData(change.value);
  //   this.canvasComparison.loadData(change.value.url);
  //   // console.log(change.value);
  // }

  logout() {
    this.authenticationService.logout();
    this.router.navigateByUrl('/login');
  }

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

  bookmarkCurrent(isPhase = false) {
    const g = this.provenance.graph;
    if (!g || !g.current) { return; }
    const nodeId = (g.current as any).id;
    if (!nodeId) { return; }
    const label = isPhase
      ? (window.prompt('Phase name:', `Phase ${this.bookmarkService.getAll().filter(b => b.isPhase).length + 1}`) || 'Phase')
      : (window.prompt('Bookmark label:', `State ${this.bookmarkService.getAll().length + 1}`) || 'Bookmark');
    this.bookmarkService.add(nodeId, label, isPhase);
  }

  get isAdmin() {
    return this.currentUser && this.currentUser.role === Role.Admin;
  }
}
