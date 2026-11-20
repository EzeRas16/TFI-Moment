import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FotoGaleria } from './foto-galeria';

describe('FotoGaleria', () => {
  let component: FotoGaleria;
  let fixture: ComponentFixture<FotoGaleria>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FotoGaleria],
    }).compileComponents();

    fixture = TestBed.createComponent(FotoGaleria);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
