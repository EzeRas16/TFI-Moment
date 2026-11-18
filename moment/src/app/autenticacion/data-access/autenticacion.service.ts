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

  iniciarSesion(email: string, contrasena: string): Observable<Usuario | null> {
    const cabeceras = new HttpHeaders({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });

    return this.http.get<Usuario[]>(this.url, { headers: cabeceras }).pipe(
      map((usuarios) => {
          const usuarioEncontrado = usuarios.find(u => {
          const coincideCorreo = u.email?.trim().toLowerCase() === email.trim().toLowerCase();
          const contrasenaEnDb = u.contrasena || (u as any).contraseña || (u as any).password;
          const coincideContrasena = String(contrasenaEnDb).trim() === String(contrasena).trim();

          return coincideCorreo && coincideContrasena;
        });

        console.log('Usuario encontrado:', usuarioEncontrado);
        return usuarioEncontrado || null;
      })
    );
  }

  registrar(nuevoUsuario: Omit<Usuario, 'id'>): Observable<Usuario> {
    const cabeceras = new HttpHeaders({
      'Cache-Control': 'no-cache, no-store, must-revalidate'
    });
    console.log('Registrando usuario:', nuevoUsuario);
    return this.http.post<Usuario>(this.url, nuevoUsuario, { headers: cabeceras });
  }
}