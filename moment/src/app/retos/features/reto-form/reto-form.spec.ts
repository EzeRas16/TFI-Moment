import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RetoForm } from './reto-form';

describe('RetoForm', () => {
  let component: RetoForm;
  let fixture: ComponentFixture<RetoForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RetoForm],
    }).compileComponents();

    fixture = TestBed.createComponent(RetoForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
