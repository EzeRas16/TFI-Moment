import { HttpClient } from '@angular/common/http';
import { Injectable, Service , inject } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Foto, FotoNueva } from './foto.model';

@Service()
export class FotoClient {
  private readonly http = inject(HttpClient);
  private readonly url = 'http://localhost:3000/fotos';

  guardarFoto(foto: FotoNueva): Observable<Foto> {
    return this.http.post<Foto>(this.url, foto);
  }

  obtenerFotosPorEvento(eventoId: number | string): Observable<Foto[]> {
  return this.http.get<Foto[]>(`${this.url}?eventoId=${eventoId}&estado=Visible`);
}

  ocultarFoto(id: number | string): Observable<Foto> {
    return this.http.patch<Foto>(`${this.url}/${id}`, { estado: 'Oculta' });
  }

  obtenerFotoDelInvitadoEnReto( // este metodo es para obtener la foto de un invitado en un reto específico, asi cuando abre el detalle del reto ve o la foto o el boton para subir
  retoId: number | string, // pero solo la de el, no la de todos
  invitadoId: number | string,
): Observable<Foto | null> {
  return this.http
    .get<Foto[]>(`${this.url}?retoId=${retoId}&invitadoId=${invitadoId}&estado=Visible`) 
    .pipe(map((fotos) => fotos[0] ?? null));
}
}
