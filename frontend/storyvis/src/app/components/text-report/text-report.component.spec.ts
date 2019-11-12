import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TextReportComponent } from './text-report.component';

describe('TextReportComponent', () => {
  let component: TextReportComponent;
  let fixture: ComponentFixture<TextReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TextReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TextReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
