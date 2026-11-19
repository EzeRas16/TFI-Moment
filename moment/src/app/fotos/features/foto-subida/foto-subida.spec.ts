import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FotoSubida } from './foto-subida';

describe('FotoSubida', () => {
  let component: FotoSubida;
  let fixture: ComponentFixture<FotoSubida>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FotoSubida],
    }).compileComponents();

    fixture = TestBed.createComponent(FotoSubida);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
