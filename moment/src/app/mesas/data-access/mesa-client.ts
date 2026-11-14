import { Mesa, MesaFormulario } from './mesa.model';
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})

export class MesaClient {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:3000/mesas';

  getMesasPorEvento(eventoId: string | number): Observable<Mesa[]> {
    return this.http.get<Mesa[]>(`${this.apiUrl}?eventoId=${eventoId}`);
  }

  getMesaById(id: string | number): Observable<Mesa> {
    return this.http.get<Mesa>(`${this.apiUrl}/${id}`);
  }

  crearMesa(datos: MesaFormulario): Observable<Mesa> {
    const nuevaMesa: Omit<Mesa, 'id'> = {
      ...datos,
      codigoQr: crypto.randomUUID(),
    };
    return this.http.post<Mesa>(this.apiUrl, nuevaMesa);
  }

  actualizarMesa(id: string | number, cambios: Partial<Mesa>): Observable<Mesa> {
    return this.http.patch<Mesa>(`${this.apiUrl}/${id}`, cambios);
  }

  eliminarMesa(id: string | number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
