import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MesaFormulario } from './mesa-formulario';


describe('MesaFormulario', () => {
  let component: MesaFormulario;
  let fixture: ComponentFixture<MesaFormulario>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MesaFormulario],
    }).compileComponents();

    fixture = TestBed.createComponent(MesaFormulario);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
