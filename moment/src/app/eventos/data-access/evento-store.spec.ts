import { TestBed } from '@angular/core/testing';
import { EventoStore } from './evento-store';

describe('EventoStore', () => {
  let service: EventoStore;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EventoStore);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
