import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { StyledSliderExplorationComponent } from './styled-slider-exploration.component';

describe('StyledSliderExplorationComponent', () => {
  let component: StyledSliderExplorationComponent;
  let fixture: ComponentFixture<StyledSliderExplorationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      declarations: [ StyledSliderExplorationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StyledSliderExplorationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});