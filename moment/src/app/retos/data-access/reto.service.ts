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

  crearReto(nuevoReto: Omit<Reto, 'id'>): Observable<Reto> {
    const retoConId = {
      ...nuevoReto,
      id: Date.now()
    };
    return this.http.post<Reto>(this.url, retoConId);
  }
}