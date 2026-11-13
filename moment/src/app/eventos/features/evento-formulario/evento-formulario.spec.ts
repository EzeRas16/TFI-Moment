import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EventoFormulario } from './evento-formulario';

describe('EventoFormulario', () => {
  let component: EventoFormulario;
  let fixture: ComponentFixture<EventoFormulario>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventoFormulario],
    }).compileComponents();

    fixture = TestBed.createComponent(EventoFormulario);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
