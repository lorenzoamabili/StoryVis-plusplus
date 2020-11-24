import { TestBed } from "@angular/core/testing";
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { SlidesContainerComponent } from './slides-container.component';


describe('SlidesContainerComponent', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [HttpClientTestingModule], 
    providers: [SlidesContainerComponent]
  }));

  it('should create', () => {
    TestBed.configureTestingModule({declarations: [SlidesContainerComponent]});
    const fixture = TestBed.createComponent(SlidesContainerComponent);
    const component = fixture.componentInstance;
    expect(component).toBeDefined();
    expect(component).toBeTruthy();
  });
});