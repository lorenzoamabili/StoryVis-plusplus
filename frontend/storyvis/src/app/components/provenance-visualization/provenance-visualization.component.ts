import { Component, ElementRef, OnInit, ViewEncapsulation } from '@angular/core';
import { ProvenanceService, AuthenticationService } from '../../shared/_services';
import { ProvenanceTreeVisualization } from '@visualstorytelling/provenance-tree-visualization';
import { User } from 'src/app/shared/_models';

@Component({
  selector: 'app-provenance-visualization',
  template: '',
  styleUrls: ['./provenance-visualization.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class ProvenanceVisualizationComponent implements OnInit {
  currentUser: User;
m
  public _viz: ProvenanceTreeVisualization;

  constructor(public elementRef: ElementRef, public provenance: ProvenanceService, 
    public authenticationService: AuthenticationService) {
    this.authenticationService.currentUser.subscribe(x => this.currentUser = x);
    this.currentUser = this.authenticationService.currentUserValue;
  }

  ngOnInit() {
     (window as any).tree = this;
      this._viz = new ProvenanceTreeVisualization(
        this.provenance.traverser,
        this.elementRef.nativeElement,
        this.currentUser.group
      );
  }
  // ngAfterViewChecked() {
  //   this._viz.setZoomExtent();
  // }

}
