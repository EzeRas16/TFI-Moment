import { Injectable, signal, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ROUTE_SEGMENTS } from '../../app.route.segments';

@Injectable({
  providedIn: 'root'
})
export class AutenticacionStateService {
  
  private router = inject(Router); 
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

  setSession(usuarioData: any) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(usuarioData));
    this.currentUserSignal.set(usuarioData);
  }

  // Método para cerrar sesión
  logout() {
    localStorage.removeItem(this.STORAGE_KEY);
    this.currentUserSignal.set(null);

    this.router.navigate(['/auth']);
  }
}