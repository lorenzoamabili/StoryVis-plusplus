import { Component, Input, OnInit } from '@angular/core';
import { first } from 'rxjs/operators';
import { BrainvisCanvasComponent } from '../brainvis-canvas/brainvis-canvas.component';
import { ProvenanceService, AuthenticationService, UserService } from '../../shared/_services';
import { User, Role, Provenance, Story, TextReport } from 'src/app/shared/_models';
import { ToolComponent } from 'src/app/pages/tool/tool.component';

@Component({
  selector: 'app-menu-bar',
  templateUrl: './menu-bar.component.html',
  styleUrls: ['./menu-bar.component.css']
})
export class MenuBarComponent implements OnInit {
  @Input() canvas: BrainvisCanvasComponent;
  @Input() IDcreator: ToolComponent;
  
  public now: string;

  currentUser: User;
  graphs: Provenance[] = [];
  stories: Story[] = [];
  textReports: TextReport[] = [];

  constructor(
    private userService: UserService,
    private authenticationService: AuthenticationService,
    public provenance: ProvenanceService
  ) {
    this.currentUser = this.authenticationService.currentUserValue;

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
