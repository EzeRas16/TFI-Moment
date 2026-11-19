import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Encuesta } from './encuesta.model';

@Injectable({
  providedIn: 'root',
})
export class EncuestaClient {
  private readonly http = inject(HttpClient);
  private readonly url = 'http://localhost:3000/encuestas';

  obtenerEncuestasPorEvento(eventoId: string | number): Observable<Encuesta[]> {
    return this.http.get<Encuesta[]>(`${this.url}?eventoId=${eventoId}`);
  }

  crearEncuesta(encuesta: Encuesta): Observable<Encuesta> {
    return this.http.post<Encuesta>(this.url, encuesta);
  }

  actualizarEncuesta(id: string, encuesta: Encuesta): Observable<Encuesta> {
    return this.http.put<Encuesta>(`${this.url}/${id}`, encuesta);
  }

  eliminarEncuesta(id: string): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}