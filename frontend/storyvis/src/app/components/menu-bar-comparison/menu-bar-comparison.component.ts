import { Component, Input, OnInit } from '@angular/core';
import { first } from 'rxjs/operators';
import { ProvenanceService, UserService, AuthenticationService } from '../../shared/_services';
import { Role, Provenance, Story, TextReport, User } from '../../shared/_models';
import { Router } from '@angular/router';
import { Settings } from '../brainvis-canvas/utils/settings';
import { ComparisonComponent } from '../brainvis-canvas/comparison.component';

@Component({
  selector: 'app-menu-bar-comparison',
  templateUrl: './menu-bar-comparison.component.html',
  styleUrls: ['./menu-bar-comparison.component.css']
})
export class MenuBarComparisonComponent implements OnInit {
  @Input() canvasComparison: ComparisonComponent;
  @Input() IDcreator: number;
  @Input() studyStarted: boolean;
  public now: string;
  public settings = Settings.getInstance(this);

  currentUser: User;
  graphs: Provenance[] = [];
  stories: Story[] = [];
  textReports: TextReport[] = [];

  constructor(
    private userService: UserService,
    public provenance: ProvenanceService,
    private router: Router,
    private authenticationService: AuthenticationService
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

  // public dataSources = [
  //   { name: 'tcia_1', url: 'https://rawcdn.githack.com/VisualStorytelling/data/a9dd031a51006b8d36aba5c510f0e140616e6bbc/tcia/20000101000000__3000566.nii.gz' },
  //   { name: 'adi_brain', url: 'https://rawcdn.githack.com/VisualStorytelling/data/94dd382a51958824eb6bf4cf529f5b7bce383f99/fnndsc/adi_brain.nii.gz' },
  //   { name: 'adi_slice', url: 'https://rawcdn.githack.com/VisualStorytelling/data/94dd382a51958824eb6bf4cf529f5b7bce383f99/fnndsc/adi_slice.nii.gz' },
  //   { name: 'carp', url: 'https://rawcdn.githack.com/VisualStorytelling/data/94dd382a51958824eb6bf4cf529f5b7bce383f99/mricrogl/carp.nii.gz' },
  //   { name: 'chris t1', url: 'https://rawcdn.githack.com/VisualStorytelling/data/94dd382a51958824eb6bf4cf529f5b7bce383f99/mricrogl/chris_t1.nii.gz' },
  //   { name: 'visiblehuman', url: 'https://rawcdn.githack.com/VisualStorytelling/data/94dd382a51958824eb6bf4cf529f5b7bce383f99/mricrogl/visiblehuman.nii.gz' }
  // ];

  // public setDataSource(change: MatSelectChange) {
  //   this.canvas.loadData(change.value);
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
