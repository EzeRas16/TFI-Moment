import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ROUTE_SEGMENTS } from '../../../app.route.segments';
import { AutenticacionStateService } from '../../../autenticacion/data-access/autenticacion-state.service';
import { EventoClient } from '../../data-access/evento-client';
import { Evento } from '../../data-access/evento.model';
import { EventoFormulario } from '../evento-formulario/evento-formulario';
import { RetoForm } from '../../../retos/features/reto-form/reto-form';

@Component({
  imports: [EventoFormulario,RetoForm],
  selector: 'app-evento-detalle',
  styleUrl: './evento-detalle.css',
  templateUrl: './evento-detalle.html',
})
export class EventoDetalle implements OnInit {
  private readonly servicio = inject(EventoClient);
  private readonly sesion = inject(AutenticacionStateService);
  private readonly router = inject(Router);
  private readonly ruta = inject(ActivatedRoute);

  protected readonly editando = signal(false);
  protected readonly evento = signal<Evento | null>(null);
  protected readonly id = this.ruta.snapshot.paramMap.get('id')!;
  protected readonly estadoCancelado = 'Cancelado';

  // Dueño del evento o admin, y siempre que no esté cancelado
  protected readonly puedeModificar = computed(() => {
    const e = this.evento();
    const usuario = this.sesion.currentUser();
    if (!e || !usuario) return false;
    const esAdmin = usuario.rol === 'ADMIN';
    const esDueno = String(e.usuarioId) === String(usuario.id);
    return (esAdmin || esDueno) && e.estado !== this.estadoCancelado;
  });

  async ngOnInit() {
    try {
      const e = await firstValueFrom(this.servicio.obtenerEventoPorId(this.id));
      const usuario = this.sesion.currentUser();
      const tieneAcceso =
        !!usuario && (usuario.rol === 'ADMIN' || String(e.usuarioId) === String(usuario.id));
      if (!tieneAcceso) {
        alert('No tenés acceso a este evento');
        this.irALista();
        return;
      }
      this.evento.set(e);
    } catch {
      alert('Evento no encontrado');
      this.irALista();
    }
  }

  async darDeBaja() {
    const e = this.evento();
    if (!e || !this.puedeModificar()) return;
    if (!confirm(`¿Desea dar de baja el evento "${e.nombre}"?`)) return;
    try {
      this.evento.set(await firstValueFrom(this.servicio.darDeBajaEvento(e.id)));
      this.editando.set(false);
    } catch {
      alert('No se pudo dar de baja el evento');
    }
  }

  editar(e: Evento) {
    this.evento.set(e);
    this.editando.set(false);
  }

  irAGestionRetos(eventoId: string | number) {
  this.router.navigate(['/', ROUTE_SEGMENTS.eventos, eventoId, ROUTE_SEGMENTS.retos]);
}

  irALista() {
    this.router.navigate(['/', ROUTE_SEGMENTS.eventos]);
  }
}