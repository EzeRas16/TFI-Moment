import { HttpClient } from '@angular/common/http';
import { Service , inject } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Foto, FotoNueva, Id } from './foto.model';

@Service()
export class FotoClient {
  private readonly http = inject(HttpClient);
  private readonly url = 'http://localhost:3000/fotos';

  guardarFoto(foto: FotoNueva): Observable<Foto> {
    return this.http.post<Foto>(this.url, foto);
  }

  obtenerFotosPorEvento(eventoId: Id): Observable<Foto[]> {
  return this.http.get<Foto[]>(this.url, { params: { eventoId, estado: 'Visible' } });
}

  ocultarFoto(id: number | string): Observable<Foto> {
    return this.http.patch<Foto>(`${this.url}/${id}`, { estado: 'Oculta' });
  }

obtenerFotoDelInvitadoEnReto(retoId: Id, invitadoId: Id): Observable<Foto | null> {// este metodo es para obtener la foto de un invitado en un reto específico
  return this.http // , asi cuando abre el detalle del reto ve o la foto o el boton para subir, pero solo la de el, no la de todos
    .get<Foto[]>(this.url, { params: { retoId, invitadoId, estado: 'Visible' } })
    .pipe(map((fotos) => fotos[0] ?? null));
}
}
