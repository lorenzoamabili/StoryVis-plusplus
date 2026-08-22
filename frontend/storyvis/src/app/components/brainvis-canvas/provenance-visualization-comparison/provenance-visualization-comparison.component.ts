import { Component, ElementRef, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { ProvenanceService } from '../../../shared/_services';
import { ProvenanceTreeVisualization } from '@visualstorytelling/provenance-tree-visualization';
import { ProvenanceGraphTraverser } from '@visualstorytelling/provenance-core';
import { Settings } from '../utils/settings';

@Component({
  selector: 'app-provenance-visualization-comparison',
  template: '',
  styleUrls: ['./provenance-visualization-comparison.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class ProvenanceVisualizationComparisonComponent implements OnInit, OnDestroy {
  private _viz: ProvenanceTreeVisualization;
  private settings = Settings.getInstance(this);

  constructor(private elementRef: ElementRef, private provenance: ProvenanceService) {}

  ngOnInit() {
    this.provenance.treeComparison = this;
    if (this.settings.isEducationMode) {
      this.createTree(this.provenance.traverserEducation);
    } else if (this.settings.isComparisonMode) {
      this.createTree(this.provenance.traverserComparison);
    }
  }

  ngOnDestroy() {
    if (this.provenance.treeComparison === this) { this.provenance.treeComparison = null; }
  }

  rewire(traverser: ProvenanceGraphTraverser) {
    try { (this._viz as any)?.free?.(); } catch (_) {}
    this._viz = this.createTree(traverser);
    try { (this._viz as any).update(); } catch (_) {}
  }

  createTree(traverser: ProvenanceGraphTraverser): ProvenanceTreeVisualization {
    // bindGlobalControls=false — this is a secondary (comparison/education) tree;
    // the global Alt+key shortcuts must stay bound to the main provenance tree only.
    return this._viz = new ProvenanceTreeVisualization(
      traverser,
      this.elementRef.nativeElement,
      'ProvGraph',
      false,
    );
  }

  getElement() { return this.elementRef; }
}
