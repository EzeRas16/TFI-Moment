import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RetoDetalle } from './reto-detalle';

describe('RetoDetalle', () => {
  let component: RetoDetalle;
  let fixture: ComponentFixture<RetoDetalle>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RetoDetalle],
    }).compileComponents();

    fixture = TestBed.createComponent(RetoDetalle);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
