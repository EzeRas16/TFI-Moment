import { TestBed } from '@angular/core/testing';
import { InvitadoStore } from './invitado-store';

describe('InvitadoStore', () => {
  let service: InvitadoStore;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InvitadoStore);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
