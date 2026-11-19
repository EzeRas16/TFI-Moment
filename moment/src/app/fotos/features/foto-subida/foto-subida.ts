import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, input, output, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import {
  CloudinaryClient,
  RespuestaCloudinary,
  TAMANIO_MAXIMO_MB,
  validarArchivo,
} from '../../data-access/cloudinary-client';
import { FotoClient } from '../../data-access/foto.client';
import { Foto } from '../../data-access/foto.model';

function mensajeDeError(error: unknown, servicio: string): string {
  if (error instanceof HttpErrorResponse) {
    if (error.status === 0) {
      return `No hay conexión con ${servicio}. Revisá que esté disponible.`;
    }
    const motivo = error.error?.error?.message;
    return motivo
      ? `${servicio} rechazó la solicitud: ${motivo}`
      : `${servicio} respondió con un error (${error.status}).`;
  }
  return 'Ocurrió un error inesperado.';
}

@Component({
  imports: [],
  selector: 'app-foto-subida',
  styleUrl: './foto-subida.css',
  templateUrl: './foto-subida.html',
})
export class FotoSubida {
  readonly eventoId = input<number | string | null>(null);
  readonly retoId = input<number | string | null>(null);
  readonly invitadoId = input<number | string | null>(null);
  readonly subida = output<Foto>();

  private readonly cloudinary = inject(CloudinaryClient);
  private readonly fotoClient = inject(FotoClient);

  protected readonly maximoMb = TAMANIO_MAXIMO_MB;
  protected readonly subiendo = signal(false);
  protected readonly error = signal('');
  protected readonly vistaPrevia = signal<string | null>(null);
  protected readonly pendiente = signal<RespuestaCloudinary | null>(null);

  protected async alElegirArchivo(evento: Event) {
    const campo = evento.target as HTMLInputElement;
    const archivo = campo.files?.[0];
    if (!archivo) return;
    campo.value = '';

    const problema = validarArchivo(archivo);
    if (problema) {
      this.error.set(problema);
      return;
    }

    if (this.eventoId() === null || this.retoId() === null || this.invitadoId() === null) {
      this.error.set('Faltan datos del evento, del reto o del invitado.');
      return;
    }

    this.error.set('');
    this.pendiente.set(null);
    this.subiendo.set(true);

    try {
      const respuesta = await firstValueFrom(this.cloudinary.subirImagen(archivo)); // Etapa 1: Cloudinary
      this.pendiente.set(respuesta);
      await this.guardar(respuesta); // Etapa 2: JSON Server
    } catch (e) {
      this.error.set(mensajeDeError(e, this.pendiente() ? 'el servidor local' : 'Cloudinary'));
    } finally {
      this.subiendo.set(false);
    }
  }

  protected async reintentarGuardado() {
    const respuesta = this.pendiente();
    if (!respuesta) return;

    this.error.set('');
    this.subiendo.set(true);

    try {
      await this.guardar(respuesta);
    } catch (e) {
      this.error.set(mensajeDeError(e, 'el servidor local'));
    } finally {
      this.subiendo.set(false);
    }
  }

  private async guardar(respuesta: RespuestaCloudinary) {
    const foto = await firstValueFrom(
      this.fotoClient.guardarFoto({
        eventoId: this.eventoId()!,
        retoId: this.retoId()!,
        invitadoId: this.invitadoId()!,
        urlCloudinary: respuesta.secure_url,
        publicId: respuesta.public_id,
        fechaSubida: new Date().toISOString(),
        estado: 'Visible',
      }),
    );

    this.pendiente.set(null);
    this.vistaPrevia.set(respuesta.secure_url);
    this.subida.emit(foto);
  }
}