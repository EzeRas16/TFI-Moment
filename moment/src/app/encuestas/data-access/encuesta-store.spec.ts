import { TestBed } from '@angular/core/testing';
import { EncuestaStore } from './encuesta-store';

describe('EncuestaStore', () => {
  let service: EncuestaStore;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EncuestaStore);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
