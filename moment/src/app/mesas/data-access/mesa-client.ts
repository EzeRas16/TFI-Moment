import { Mesa, MesaFormulario } from './mesa.model';
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs'; // <-- Importar map

@Injectable({
  providedIn: 'root',
})
export class MesaClient {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:3000/mesas';

  // Cambiamos para que traiga todas y filtre por el eventoId localmente
  getMesasPorEvento(eventoId: string | number): Observable<Mesa[]> {
    return this.http.get<Mesa[]>(this.apiUrl).pipe(
      map((mesas) => mesas.filter(m => String(m.eventoId) === String(eventoId)))
    );
  }

  getMesaById(id: string | number): Observable<Mesa> {
    return this.http.get<Mesa>(`${this.apiUrl}/${id}`);
  }

  crearMesa(mesa: MesaFormulario): Observable<Mesa> {
    return this.http.post<Mesa>(this.apiUrl, mesa);
  }

  actualizarMesa(id: string | number, cambios: Partial<Mesa>): Observable<Mesa> {
    return this.http.patch<Mesa>(`${this.apiUrl}/${id}`, cambios);
  }

  eliminarMesa(id: string | number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  generarQrMesa(id: string | number, enlaceQr: string): Observable<Mesa> {
    return this.http.patch<Mesa>(`${this.apiUrl}/${id}`, { codigoQr: enlaceQr });
  }
}