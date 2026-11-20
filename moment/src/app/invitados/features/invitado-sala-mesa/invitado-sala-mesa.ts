import { Component, inject, input, output, signal } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Invitado } from '../../data-access/invitado.model';
import { VotarEncuesta } from '../../../votos/features/voto-formulario/voto-encuesta';
import { RetoInvitadoLista } from '../../../retos/features/reto-invitado-lista/reto-invitado-lista';
import { InvitadoPerfilEditar } from '../invitado-perfil-editar/invitado-perfil-editar';
import { ROUTE_SEGMENTS } from '../../../app.route.segments';

@Component({
  selector: 'app-invitado-sala-mesa',
  standalone: true,
  imports: [VotarEncuesta, RetoInvitadoLista, InvitadoPerfilEditar],
  templateUrl: './invitado-sala-mesa.html',
  styleUrl: './invitado-sala-mesa.css',
})
export class InvitadoSalaMesa {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  readonly invitado = input.required<Invitado>();
  readonly mesaToken = input<string>('');
  readonly invitadoActualizado = output<Invitado>();
  readonly salir = output<void>();

  readonly editandoPerfil = signal<boolean>(false);
  readonly errorMensaje = signal<string | null>(null);
  readonly cargandoRetos = signal<boolean>(false);
  readonly mostrarRetos = signal<boolean>(false);
  readonly eventoIdRetos = signal<string | number | null>(null);
  readonly cargandoGaleria = signal<boolean>(false);

  activarEdicion(): void {
    this.errorMensaje.set(null);
    this.editandoPerfil.set(true);
  }

  onGuardado(actualizado: Invitado): void {
    this.editandoPerfil.set(false);
    this.invitadoActualizado.emit(actualizado);
  }

  salirDeLaMesa(): void {
    localStorage.removeItem('invitado_actual');
    this.editandoPerfil.set(false);
    this.mostrarRetos.set(false);
    this.errorMensaje.set(null);
    this.salir.emit();
  }

  irARetos(): void {
    if (this.mostrarRetos()) {
      this.mostrarRetos.set(false);
      return;
    }

    const mesaId = this.invitado().mesaId || this.mesaToken();
    if (!mesaId) {
      this.eventoIdRetos.set(null);
      this.mostrarRetos.set(true);
      return;
    }

    this.cargandoRetos.set(true);
    this.errorMensaje.set(null);

    this.http.get<any[]>('http://localhost:3000/mesas').subscribe({
      next: (mesas) => {
        this.cargandoRetos.set(false);
        const mesa = mesas.find(
          (m) =>
            String(m.id) === String(mesaId) ||
            (m.codigoQr && String(m.codigoQr).includes(String(mesaId))),
        );
        this.eventoIdRetos.set(mesa?.eventoId ?? null);
        this.mostrarRetos.set(true);
      },
      error: () => {
        this.cargandoRetos.set(false);
        this.eventoIdRetos.set(null);
        this.mostrarRetos.set(true);
      },
    });
  }

  private navegarAGaleria(eventoId: string | number): void {
    this.router.navigate(['/', ROUTE_SEGMENTS.eventos, eventoId, ROUTE_SEGMENTS.galeria]);
  }

  async irAGaleria(): Promise<void> {
    const mesaId = this.invitado().mesaId || this.mesaToken();
    if (!mesaId) return;

    const eventoIdConocido = this.eventoIdRetos();
    if (eventoIdConocido !== null) {
      this.navegarAGaleria(eventoIdConocido);
      return;
    }

    this.cargandoGaleria.set(true);
    this.errorMensaje.set(null);

    try {
      const mesas = await firstValueFrom(this.http.get<any[]>('http://localhost:3000/mesas'));
      const mesa = mesas.find(
        (m) =>
          String(m.id) === String(mesaId) ||
          (m.codigoQr && String(m.codigoQr).includes(String(mesaId))),
      );

      if (mesa?.eventoId) {
        this.navegarAGaleria(mesa.eventoId);
      } else {
        this.errorMensaje.set('No se pudo encontrar el evento de tu mesa.');
      }
    } catch {
      this.errorMensaje.set('No se pudo abrir la galería. Intentá de nuevo.');
    } finally {
      this.cargandoGaleria.set(false);
    }
  }
}