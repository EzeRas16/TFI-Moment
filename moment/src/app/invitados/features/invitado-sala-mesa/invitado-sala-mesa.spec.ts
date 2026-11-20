import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InvitadoSalaMesa } from './invitado-sala-mesa';

describe('InvitadoSalaMesa', () => {
  let component: InvitadoSalaMesa;
  let fixture: ComponentFixture<InvitadoSalaMesa>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InvitadoSalaMesa],
    }).compileComponents();

    fixture = TestBed.createComponent(InvitadoSalaMesa);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
