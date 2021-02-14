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
  public _viz: ProvenanceTreeVisualization;
  public currentUser: User;

  constructor(public elementRef: ElementRef, public provenance: ProvenanceService, private authenticationService: AuthenticationService) {
    this.currentUser = this.authenticationService.currentUserValue;
  }

  ngOnInit() {
    (window as any).tree = this;
    var traverser = this.provenance.traverser;
    this.createTree(traverser);
  }


  createTree(traverser) {
    return this._viz = new ProvenanceTreeVisualization(
      traverser,
      this.elementRef.nativeElement,
      "ProvGraph"
    );
  }

  public getElement(): any {
    return this.elementRef;
  }
}