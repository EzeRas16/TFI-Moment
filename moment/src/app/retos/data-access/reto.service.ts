import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Reto } from './reto.model';

@Injectable({
  providedIn: 'root'
})
export class RetoService {
  private http = inject(HttpClient);
  private url = 'http://localhost:3000/retos';

  obtenerRetos(): Observable<Reto[]> {
    return this.http.get<Reto[]>(this.url);
  }

  crearReto(nuevoReto: Omit<Reto, 'id'>): Observable<Reto> {
    const retoConId = {
      ...nuevoReto,
      id: Date.now()
    };
    return this.http.post<Reto>(this.url, retoConId);
  }

  eliminarReto(id: number | string): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}