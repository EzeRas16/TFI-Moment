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

    return this.http.get<Usuario[]>(this.url, { headers }).pipe(
      map((usuarios) => {
          const usuarioEncontrado = usuarios.find(u => {
          const emailMatch = u.email?.trim().toLowerCase() === email.trim().toLowerCase();
          const passEnDb = u.contrasena || (u as any).contraseña || (u as any).password;
          const passMatch = String(passEnDb).trim() === String(contrasena).trim();

          return emailMatch && passMatch;
        });

        console.log('Usuario encontrado:', usuarioEncontrado);
        return usuarioEncontrado || null;
      })
    );
  }
  registrar(nuevoUsuario: Omit<Usuario, 'id'>): Observable<Usuario> {
    const headers = new HttpHeaders({
      'Cache-Control': 'no-cache, no-store, must-revalidate'
    });
    console.log('Registrando usuario:', nuevoUsuario);
    return this.http.post<Usuario>(this.url, nuevoUsuario, { headers });
  }
}