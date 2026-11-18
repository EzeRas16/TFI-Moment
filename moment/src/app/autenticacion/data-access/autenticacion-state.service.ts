import { Injectable, signal, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ROUTE_SEGMENTS } from '../../app.route.segments';

@Injectable({
  providedIn: 'root'
})
export class AutenticacionStateService {
  
  private router = inject(Router); 
  private readonly CLAVE_STORAGE = 'usuario_moment';

  private usuarioActualSignal = signal<any>(this.cargarUsuarioDeLocalStorage());

  readonly currentUser = this.usuarioActualSignal.asReadonly();
  readonly isLoggedIn = computed(() => !!this.usuarioActualSignal());

  private cargarUsuarioDeLocalStorage() {
    const usuarioAlmacenado = localStorage.getItem(this.CLAVE_STORAGE);
    return usuarioAlmacenado ? JSON.parse(usuarioAlmacenado) : null;
  }

  establecerSesion(datosUsuario: any) {
    localStorage.setItem(this.CLAVE_STORAGE, JSON.stringify(datosUsuario));
    this.usuarioActualSignal.set(datosUsuario);
  }

  cerrarSesion() {
    localStorage.removeItem(this.CLAVE_STORAGE);
    this.usuarioActualSignal.set(null);

    this.router.navigate(['/auth']);
  }
}