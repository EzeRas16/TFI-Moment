import { Component, inject, input, output, signal } from '@angular/core';
import { Foto } from '../../data-access/foto.model';
import { CloudinaryClient, TAMANIO_MAXIMO_MB, validarArchivo } from '../../data-access/cloudinary-client';
import { FotoClient } from '../../data-access/foto.client';
import { firstValueFrom } from 'rxjs';

@Component({
  imports: [],
  selector: 'app-foto-subida',
  styleUrl: './foto-subida.css',
  templateUrl: './foto-subida.html',
})
export class FotoSubida {
  readonly eventoId = input.required<number>();
  readonly retoId = input<number | null>(null);
  readonly invitadoId = input<number | null>(null);
  readonly subida = output<Foto>(); 

  private readonly cloudinary = inject(CloudinaryClient);
  private readonly fotoClient = inject(FotoClient);

  protected readonly maximoMb = TAMANIO_MAXIMO_MB;
  protected readonly subiendo = signal(false);
  protected readonly error = signal('');
  protected readonly vistaPrevia = signal<string | null>(null);

  protected async alElegirArchivo(evento: Event) {
    const campo = evento.target as HTMLInputElement;
    const archivo = campo.files?.[0];
    if (!archivo) return;

    const problema = validarArchivo(archivo); // Verifica formato (JPG/PNG) y peso máximo
    if (problema) {
      this.error.set(problema);
      campo.value = '';
      return;
    }

    this.error.set('');
    this.subiendo.set(true);
    try {
      const respuesta = await firstValueFrom(this.cloudinary.subirImagen(archivo)); // Sube el binario directo a Cloudinary
      const foto = await firstValueFrom( // Persiste los metadatos y la URL en db.json
        this.fotoClient.guardarFoto({
          eventoId: this.eventoId(),
          retoId: this.retoId(),
          invitadoId: this.invitadoId(),
          urlCloudinary: respuesta.secure_url,
          publicId: respuesta.public_id,
          fechaSubida: new Date().toISOString(),
          estado: 'Visible',
        }),
      );
      this.vistaPrevia.set(respuesta.secure_url);
      this.subida.emit(foto);
    } catch {
      this.error.set('No se pudo subir la foto. Intentá de nuevo.');
    } finally {
      this.subiendo.set(false);
      campo.value = ''; // Limpia el input para permitir volver a elegir el mismo archivo
    }
  }
}