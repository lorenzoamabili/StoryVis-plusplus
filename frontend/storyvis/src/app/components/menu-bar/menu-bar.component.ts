import { Component, Input, OnInit } from '@angular/core';
import { first } from 'rxjs/operators';
import { BrainvisCanvasComponent } from '../brainvis-canvas/brainvis-canvas.component';
import { ProvenanceService, UserService, AuthenticationService } from '../../shared/_services';
import { Role, Provenance, Story, TextReport, User } from '../../shared/_models';
import { MatSelectChange } from '@angular/material/select';
import { Router } from '@angular/router';
import { Settings } from '../brainvis-canvas/utils/settings';

@Component({
  selector: 'app-menu-bar',
  templateUrl: './menu-bar.component.html',
  styleUrls: ['./menu-bar.component.css']
})
export class MenuBarComponent implements OnInit {
  @Input() canvas: BrainvisCanvasComponent;
  @Input() IDcreator: number;
  @Input() studyStarted: boolean;
  public now: string;
  public settings = Settings.getInstance(this);

  currentUser: User;
  graphs: Provenance[] = [];
  stories: Story[] = [];
  textReports: TextReport[] = [];

  constructor(
    public userService: UserService,
    public provenance: ProvenanceService,
    public router: Router,
    public authenticationService: AuthenticationService
  ) {

    this.userService.getAllGraphs().pipe(first()).subscribe(graphs => {
      this.graphs = graphs;
    });
    this.userService.getAllStories().pipe(first()).subscribe(stories => {
      this.stories = stories;
    });
    this.userService.getAllTextReports().pipe(first()).subscribe(textReports => {
      this.textReports = textReports;
    });
  }

  reset(){
    this.graphs = [];
  }

  load(){
    this.userService.getAllGraphs().pipe(first()).subscribe(graphs => {
      this.graphs = graphs;
    });  
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
    setInterval(() => {
      const date = new Date();
      this.now = `${numFormat(date.getHours())}:${numFormat(date.getMinutes())}`;
    }, 1000);

  }

  get isAdmin() {
    return this.currentUser && this.currentUser.role === Role.Admin;
  }
}
