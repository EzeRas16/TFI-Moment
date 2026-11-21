import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InvitadoPerfilEditar } from './invitado-perfil-editar';

describe('InvitadoPerfilEditar', () => {
  let component: InvitadoPerfilEditar;
  let fixture: ComponentFixture<InvitadoPerfilEditar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InvitadoPerfilEditar],
    }).compileComponents();

    fixture = TestBed.createComponent(InvitadoPerfilEditar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
