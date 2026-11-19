import { TestBed } from '@angular/core/testing';
import { VotoClient } from './voto-client';

describe('VotoClient', () => {
  let service: VotoClient;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VotoClient);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
