import { TestBed } from '@angular/core/testing';
import { VotoStore } from './voto-store';

describe('VotoStore', () => {
  let service: VotoStore;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VotoStore);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
