import { TestBed } from "@angular/core/testing";
import { BrainvisCanvasComponent } from './brainvis-canvas.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';


describe('BrainvisCanvasComponent', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [HttpClientTestingModule], 
    providers: [BrainvisCanvasComponent]
  }));

  it('should create', () => {
    TestBed.configureTestingModule({declarations: [BrainvisCanvasComponent]});
    const fixture = TestBed.createComponent(BrainvisCanvasComponent);
    const component = fixture.componentInstance;
    expect(component).toBeDefined();
    expect(component).toBeTruthy();
  });
});