import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Usuario } from './usuario.model';

@Injectable({
  providedIn: 'root'
})
export class AutenticacionService {
  private http = inject(HttpClient);
  private url = 'http://localhost:3000/usuarios';

  login(email: string, contrasena: string): Observable<Usuario | null> {
    const headers = new HttpHeaders({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });

    return this.http
      .get<Usuario[]>(this.url, { 
        params: { email, contrasena }, 
        headers
      })
      .pipe(
        map((usuarios) => usuarios.length > 0 ? usuarios[0] : null)
      );
  }
}