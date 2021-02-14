import { TestBed } from "@angular/core/testing";
import { ComparisonComponent } from './comparison.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';


describe('ComparisonComponent', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [HttpClientTestingModule], 
    providers: [ComparisonComponent]
  }));

  it('should create', () => {
    TestBed.configureTestingModule({declarations: [ComparisonComponent]});
    const fixture = TestBed.createComponent(ComparisonComponent);
    const component = fixture.componentInstance;
    expect(component).toBeDefined();
    expect(component).toBeTruthy();
  });
});