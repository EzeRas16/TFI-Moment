import { TestBed } from '@angular/core/testing';
import { EventoClient } from './evento-client';

describe('EventoClient', () => {
  let service: EventoClient;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EventoClient);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
