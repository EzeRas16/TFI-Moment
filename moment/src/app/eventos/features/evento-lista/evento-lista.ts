import { Component, computed, inject, signal } from '@angular/core';
import { ROUTE_SEGMENTS } from '../../../app.route.segments';
import { EventoClient } from '../../data-access/evento-client';
import { AutenticacionStateService } from '../../../autenticacion/data-access/autenticacion-state.service';
import { Router } from '@angular/router';
import { ESTADOS } from '../../data-access/evento.model';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  imports: [], // aca se puede importar datepipe para formatear fechas en el html con slash y no con xxxx-xx-xx
  selector: 'app-evento-lista',
  styleUrl: './evento-lista.css',
  templateUrl: './evento-lista.html',
})
export class EventoLista {
  private readonly servicio = inject(EventoClient);
  private readonly sesion = inject(AutenticacionStateService);
  protected readonly router = inject(Router);
  protected readonly estados = ESTADOS;

  protected readonly haySesion = this.sesion.isLoggedIn;
  protected readonly esAdmin = computed(() => this.sesion.currentUser()?.rol === 'ADMIN');

  protected readonly lista = toSignal(this.servicio.obtenerEventos(), { initialValue: [] });

  readonly textoBusqueda = signal('');
  readonly estadoFiltro = signal(''); 

  // El admin ve todos los eventos, el usuario normal solo los suyos
  protected readonly eventosVisibles = computed(() => {
    const usuario = this.sesion.currentUser();
    if (!usuario) return [];
    if (this.esAdmin()) return this.lista();
    return this.lista().filter((e) => String(e.usuarioId) === String(usuario.id));
  });

  protected readonly eventosFiltrados = computed(() => {
    const texto = this.textoBusqueda().trim().toLowerCase();
    const estado = this.estadoFiltro();
    return this.eventosVisibles()
      .filter(
        (e) =>
          (texto === '' || e.nombre.toLowerCase().includes(texto)) &&
          (estado === '' || e.estado === estado),
      )
      .sort((a, b) => a.fecha.localeCompare(b.fecha));
  });

  alBuscar(evento: Event) {
    this.textoBusqueda.set((evento.target as HTMLInputElement).value);
  }

  alCambiarEstado(evento: Event) {
    this.estadoFiltro.set((evento.target as HTMLSelectElement).value);
  }

  limpiarFiltros() {
    this.textoBusqueda.set('');
    this.estadoFiltro.set('');
  }

  irANuevo() {
    this.router.navigate(['/', ROUTE_SEGMENTS.eventos, 'nuevo']);
  }
}

