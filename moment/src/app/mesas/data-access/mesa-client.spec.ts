import { TestBed } from '@angular/core/testing';
import { MesaClient } from './mesa-client';

describe('MesaClient', () => {
  let service: MesaClient;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MesaClient);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
