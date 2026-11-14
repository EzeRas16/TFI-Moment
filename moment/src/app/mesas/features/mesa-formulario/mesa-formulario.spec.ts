import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MesaLista } from './mesa-formulario';


describe('MesaLista', () => {
  let component: MesaLista;
  let fixture: ComponentFixture<MesaLista>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MesaLista],
    }).compileComponents();

    fixture = TestBed.createComponent(MesaLista);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
