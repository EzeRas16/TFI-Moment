import { Location } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FotoClient } from '../../../fotos/data-access/foto.client';
import { Foto } from '../../../fotos/data-access/foto.model';
import { FotoSubida } from '../../../fotos/features/foto-subida/foto-subida';
import { Invitado } from '../../../invitados/data-access/invitado.model';
import { Reto } from '../../data-access/reto.model';
import { RetoService } from '../../data-access/reto.service';

type InvitadoConId = Invitado & { id: string | number };

@Component({
  selector: 'app-reto-detalle',
  imports: [FotoSubida],
  templateUrl: './reto-detalle.html',
  styleUrl: './reto-detalle.css',
})
export default class RetoDetalle implements OnInit {
  private readonly ruta = inject(ActivatedRoute);
  private readonly ubicacion = inject(Location);
  private readonly retoService = inject(RetoService);
  private readonly fotoClient = inject(FotoClient);

  protected readonly cargando = signal(true);
  protected readonly error = signal('');
  protected readonly reto = signal<Reto | null>(null);
  protected readonly invitado = signal<InvitadoConId | null>(null);
  protected readonly foto = signal<Foto | null>(null);

  ngOnInit(): void {
    const retoId = this.ruta.snapshot.paramMap.get('retoId');
    const eventoIdUrl = this.ruta.snapshot.paramMap.get('eventoId');

    if (!retoId) {
      this.error.set('No se indicó el reto a consultar.');
      this.cargando.set(false);
      return;
    }

    const invitadoActual = this.leerInvitadoActual();
    this.invitado.set(invitadoActual);

    this.retoService.obtenerRetoPorId(retoId).subscribe({
      next: (retoEncontrado) => {
        if (
          eventoIdUrl &&
          retoEncontrado.eventoId !== undefined &&
          String(retoEncontrado.eventoId) !== String(eventoIdUrl)
        ) {
          this.error.set('Este reto no pertenece al evento.');
          this.cargando.set(false);
          return;
        }

        this.reto.set(retoEncontrado);

        if (invitadoActual) {
          this.buscarFotoDelInvitado(retoEncontrado.id, invitadoActual.id);
        } else {
          this.cargando.set(false);
        }
      },
      error: () => {
        this.error.set('No se pudo cargar el detalle del reto.');
        this.cargando.set(false);
      },
    });
  }

  protected volver(): void {
    this.ubicacion.back();
  }

  private buscarFotoDelInvitado(retoId: string | number, invitadoId: string | number): void {
    this.fotoClient.obtenerFotoDelInvitadoEnReto(retoId, invitadoId).subscribe({
      next: (fotoExistente) => {
        this.foto.set(fotoExistente);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudo verificar si ya subiste una foto para este reto.');
        this.cargando.set(false);
      },
    });
  }

  private leerInvitadoActual(): InvitadoConId | null {
    const textoGuardado = localStorage.getItem('invitado_actual');
    if (!textoGuardado) return null;
    try {
      const invitadoGuardado = JSON.parse(textoGuardado) as Invitado;
      if (invitadoGuardado.id === undefined || invitadoGuardado.id === null) return null;
      return { ...invitadoGuardado, id: invitadoGuardado.id };
    } catch {
      return null;
    }
  }
}