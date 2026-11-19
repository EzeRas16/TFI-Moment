import { HttpClient } from '@angular/common/http';
import { Injectable, Service , inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Foto, FotoNueva } from './foto.model';

@Service()
export class FotoClient {
  private readonly http = inject(HttpClient);
  private readonly url = 'http://localhost:3000/fotos';

  guardarFoto(foto: FotoNueva): Observable<Foto> {
    return this.http.post<Foto>(this.url, foto);
  }

  obtenerFotosPorEvento(eventoId: number): Observable<Foto[]> {
    return this.http.get<Foto[]>(`${this.url}?eventoId=${eventoId}`);
  }

  ocultarFoto(id: number): Observable<Foto> {
    return this.http.patch<Foto>(`${this.url}/${id}`, { estado: 'Oculta' });
  }
}
