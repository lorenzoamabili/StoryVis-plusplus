import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ProvenanceVisualizationComparisonComponent } from './provenance-visualization-comparison.component';

describe('ProvenanceVisualizationComparisonComponent', () => {
  let component: ProvenanceVisualizationComparisonComponent;
  let fixture: ComponentFixture<ProvenanceVisualizationComparisonComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      declarations: [ ProvenanceVisualizationComparisonComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProvenanceVisualizationComparisonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});