import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VotarEncuesta } from './voto-encuesta';

describe('VotarEncuesta', () => {
  let component: VotarEncuesta;
  let fixture: ComponentFixture<VotarEncuesta>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VotarEncuesta],
    }).compileComponents();

    fixture = TestBed.createComponent(VotarEncuesta);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
