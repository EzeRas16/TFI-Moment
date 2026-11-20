import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MesaInvitadosPanel } from './mesa-invitados-panel';

describe('MesaInvitadosPanel', () => {
  let component: MesaInvitadosPanel;
  let fixture: ComponentFixture<MesaInvitadosPanel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MesaInvitadosPanel],
    }).compileComponents();

    fixture = TestBed.createComponent(MesaInvitadosPanel);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
