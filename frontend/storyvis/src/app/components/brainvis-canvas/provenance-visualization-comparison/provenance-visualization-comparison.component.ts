import { Component, ElementRef, OnInit, ViewEncapsulation } from '@angular/core';
import { ProvenanceService, AuthenticationService } from '../../../shared/_services';
import { ProvenanceTreeVisualization } from '@visualstorytelling/provenance-tree-visualization';
import { User } from 'src/app/shared/_models';
import { Settings } from '../utils/settings';

@Component({
  selector: 'app-provenance-visualization-comparison',
  template: '',
  styleUrls: ['./provenance-visualization-comparison.component.css'],
  encapsulation: ViewEncapsulation.None
})

export class ProvenanceVisualizationComparisonComponent implements OnInit {
  public _viz: ProvenanceTreeVisualization;
  public currentUser: User;
  public settings = Settings.getInstance(this);

  constructor(public elementRef: ElementRef, public provenance: ProvenanceService, private authenticationService: AuthenticationService) {
    this.currentUser = this.authenticationService.currentUserValue;
  }

  ngOnInit() {
    (window as any).treeComparison = this;
    if (this.settings.isEducationMode) {
      var traverser = this.provenance.traverserEducation;
      this.createTree(traverser);
    } else if (this.settings.isComparisonMode) {
      var traverser = this.provenance.traverserComparison;
      this.createTree(traverser);
    }
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