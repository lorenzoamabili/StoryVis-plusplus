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
