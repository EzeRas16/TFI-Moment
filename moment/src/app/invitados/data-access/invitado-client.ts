import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Invitado } from './invitado.model';

@Injectable({
  providedIn: 'root'
})

export class InvitadoClient {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/invitados';

  crearInvitado(invitado: Invitado): Observable<Invitado> {
    return this.http.post<Invitado>(this.apiUrl, invitado);
  }
}