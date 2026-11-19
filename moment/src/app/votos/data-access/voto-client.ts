import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Encuesta } from '../../encuestas/data-access/encuesta.model';
import { Voto } from './voto.model';

@Injectable({
  providedIn: 'root',
})
export class VotoClient {
  private readonly http = inject(HttpClient);
  private readonly urlVotos = 'http://localhost:3000/votos';
  private readonly urlEncuestas = 'http://localhost:3000/encuestas';

  obtenerEncuestasActivas(): Observable<Encuesta[]> {
    return this.http.get<Encuesta[]>(`${this.urlEncuestas}?activa=true`);
  }

  obtenerVotosPorMesa(mesaId: string | number): Observable<Voto[]> {
    return this.http.get<Voto[]>(`${this.urlVotos}?mesaId=${mesaId}`);
  }

  registrarVoto(voto: Voto): Observable<Voto> {
    return this.http.post<Voto>(this.urlVotos, voto);
  }

  actualizarEncuesta(encuestaId: string | number, encuesta: Encuesta): Observable<Encuesta> {
    return this.http.put<Encuesta>(`${this.urlEncuestas}/${encuestaId}`, encuesta);
  }
}