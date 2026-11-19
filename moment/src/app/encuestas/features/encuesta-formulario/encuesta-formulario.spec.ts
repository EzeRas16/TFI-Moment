import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EncuestaFormulario } from './encuesta-formulario';

describe('EncuestaFormulario', () => {
  let component: EncuestaFormulario;
  let fixture: ComponentFixture<EncuestaFormulario>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EncuestaFormulario],
    }).compileComponents();

    fixture = TestBed.createComponent(EncuestaFormulario);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
