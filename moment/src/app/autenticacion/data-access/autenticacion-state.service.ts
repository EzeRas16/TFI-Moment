import { Injectable, signal, computed } from '@angular/core';
import { Usuario } from './usuario.model';

@Injectable({
  providedIn: 'root'
})
export class AutenticacionStateService {
  private currentUserSignal = signal<Usuario | null>(null);

  // Señal de solo lectura para consumir en la app
  public currentUser = this.currentUserSignal.asReadonly();

  // Computada para saber si hay sesión activa
  public isLoggedIn = computed(() => this.currentUserSignal() !== null);

  // Guardar sesión al hacer login exitoso
  setSession(usuario: Usuario) {
    this.currentUserSignal.set(usuario);
  }

  // Cerrar sesión
  logout() {
    this.currentUserSignal.set(null);
  }
}