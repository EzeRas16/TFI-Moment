import { TestBed } from '@angular/core/testing';
import { EncuestaClient } from './encuesta-client';

describe('EncuestaClient', () => {
  let service: EncuestaClient;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EncuestaClient);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
