import { Component, ElementRef, OnInit, ViewEncapsulation } from '@angular/core';
import { ProvenanceService, AuthenticationService } from '../../shared/_services';
import { ProvenanceTreeVisualization } from '@visualstorytelling/provenance-tree-visualization';
import { User } from '../../shared/_models';

@Component({
  selector: 'app-provenance-visualization',
  template: '',
  styleUrls: ['./provenance-visualization.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class ProvenanceVisualizationComponent implements OnInit {
  currentUser: User;
  public _viz: ProvenanceTreeVisualization;

  constructor(public elementRef: ElementRef, public provenance: ProvenanceService, 
    public authenticationService: AuthenticationService) {
    this.authenticationService.currentUser.subscribe(x => this.currentUser = x);
    this.currentUser = this.authenticationService.currentUserValue;
  }

  ngOnInit() {
    var traverser = this.provenance.traverser;
    this.createTree(traverser);
  }


  createTree(traverser){
      this._viz = new ProvenanceTreeVisualization(
      traverser,
      this.elementRef.nativeElement,
      "ProvGraph"
    );
  }
}


(function () {
  var blockContextMenu;

  blockContextMenu = function (evt: any) {
    evt.preventDefault();
  };

  window.addEventListener('contextmenu', blockContextMenu);
})();