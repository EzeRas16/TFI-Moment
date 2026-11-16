import { Injectable, signal, computed } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AutenticacionStateService {
  
  // Clave para guardar en el navegador
  private readonly STORAGE_KEY = 'usuario_moment';

  // Inicializamos el signal leyendo del localStorage si existe una sesión previa
  private currentUserSignal = signal<any>(this.cargarUsuarioDeStorage());

  // Señales públicas para leer el estado en toda la app
  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly isLoggedIn = computed(() => !!this.currentUserSignal());

  private cargarUsuarioDeStorage() {
    const storedUser = localStorage.getItem(this.STORAGE_KEY);
    return storedUser ? JSON.parse(storedUser) : null;
  }

  // Método que ejecutas cuando el login es exitoso
  setSession(usuarioData: any) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(usuarioData));
    this.currentUserSignal.set(usuarioData);
  }

  // Método para cerrar sesión
  logout() {
    localStorage.removeItem(this.STORAGE_KEY);
    this.currentUserSignal.set(null);
  }
}