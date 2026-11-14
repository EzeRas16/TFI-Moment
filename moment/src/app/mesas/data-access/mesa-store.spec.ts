import { TestBed } from '@angular/core/testing';
import { MesaStore } from './mesa-store';

describe('MesaStore', () => {
  let service: MesaStore;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MesaStore);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
