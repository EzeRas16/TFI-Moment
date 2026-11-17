import { TestBed } from '@angular/core/testing';
import { InvitadoClient } from './invitado-client';

describe('InvitadoClient', () => {
  let service: InvitadoClient;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InvitadoClient);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
