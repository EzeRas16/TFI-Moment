import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RetoInvitadoLista } from './reto-invitado-lista';

describe('RetoInvitadoLista', () => {
  let component: RetoInvitadoLista;
  let fixture: ComponentFixture<RetoInvitadoLista>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RetoInvitadoLista],
    }).compileComponents();

    fixture = TestBed.createComponent(RetoInvitadoLista);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
