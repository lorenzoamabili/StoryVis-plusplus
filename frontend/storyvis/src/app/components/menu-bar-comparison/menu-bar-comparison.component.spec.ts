import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MenuBarComparisonComponent } from './menu-bar-comparison.component';
import { RouterTestingModule } from '@angular/router/testing';

describe('MenuBarComparisonComponent', () => {
  let component: MenuBarComparisonComponent;
  let fixture: ComponentFixture<MenuBarComparisonComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule],
      declarations: [ MenuBarComparisonComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MenuBarComparisonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});