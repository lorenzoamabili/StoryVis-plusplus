import { TestBed } from "@angular/core/testing";
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TextReportComponent } from './text-report.component';


describe('TextReportComponent', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [HttpClientTestingModule], 
    providers: [TextReportComponent]
  }));

  it('should create', () => {
    TestBed.configureTestingModule({declarations: [TextReportComponent]});
    const fixture = TestBed.createComponent(TextReportComponent);
    const component = fixture.componentInstance;
    expect(component).toBeDefined();
    expect(component).toBeTruthy();
  });
});