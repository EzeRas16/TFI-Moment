import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InvitadoFormulario } from './invitado-formulario';

describe('InvitadoFormulario', () => {
  let component: InvitadoFormulario;
  let fixture: ComponentFixture<InvitadoFormulario>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InvitadoFormulario],
    }).compileComponents();

    fixture = TestBed.createComponent(InvitadoFormulario);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
