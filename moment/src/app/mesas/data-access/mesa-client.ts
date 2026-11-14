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

  // Obtener listado de todas las mesas
  getMesas(): Observable<Mesa[]> {
    return this.http.get<Mesa[]>(this.apiUrl);
  }

  // SCRUM-15: Alta de mesa 
  crearMesa(datos: MesaFormulario): Observable<Mesa> {
    return this.http.post<Mesa>(this.apiUrl, datos);
  }

  // SCRUM-17: Modificación de mesa existente
  actualizarMesa(id: string | number, cambios: Partial<Mesa>): Observable<Mesa> {
    return this.http.patch<Mesa>(`${this.apiUrl}/${id}`, cambios);
  }

  // SCRUM-16: Eliminación de mesa
  eliminarMesa(id: string | number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}