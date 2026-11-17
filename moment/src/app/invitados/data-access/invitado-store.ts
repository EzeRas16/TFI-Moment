import { Injectable, inject, signal } from '@angular/core';
import { Invitado } from './invitado.model';
import { InvitadoClient } from './invitado-client';

@Injectable({
  providedIn: 'root'
})
export class InvitadoStore {
  private readonly invitadoClient = inject(InvitadoClient);

  private readonly _cargando = signal<boolean>(false);
  readonly cargando = this._cargando.asReadonly();

  // MÉTODOS PÚBLICOS (Acciones)

  registrarInvitado(
    invitado: Invitado,
    onSuccess?: (nuevo: Invitado) => void,
    onError?: (mensaje: string) => void
  ): void {
    this.validarApodoDisponible(invitado.apodo, undefined, onError, () => {
      this.invitadoClient.crearInvitado(invitado).subscribe({
        next: (nuevo) => {
          this._cargando.set(false);
          if (onSuccess) onSuccess(nuevo);
        },
        error: () => this.notificarError('No se pudo completar el registro.', onError)
      });
    });
  }

  actualizarInvitado(
    id: string | number,
    datos: Partial<Invitado>,
    onSuccess?: (actualizado: Invitado) => void,
    onError?: (mensaje: string) => void
  ): void {
    this.validarApodoDisponible(datos.apodo, id, onError, () => {
      this.invitadoClient.actualizarInvitado(id, datos).subscribe({
        next: (actualizado) => {
          this._cargando.set(false);
          if (onSuccess) onSuccess(actualizado);
        },
        error: () => this.notificarError('No se pudo actualizar tu perfil.', onError)
      });
    });
  }

  eliminarInvitado(
    id: string | number,
    onSuccess?: () => void,
    onError?: (mensaje: string) => void
  ): void {
    this._cargando.set(true);
    this.invitadoClient.eliminarInvitado(id).subscribe({
      next: () => {
        this._cargando.set(false);
        if (onSuccess) onSuccess();
      },
      error: (err) => {
        console.error('Error al eliminar invitado', err);
        this.notificarError('No se pudo eliminar al invitado. Intentá nuevamente.', onError);
      }
    });
  }

  
  // MÉTODOS PRIVADOS (Validaciones y Errores)

  private validarApodoDisponible(
    apodo: string | undefined,
    idActual: string | number | undefined,
    onError: ((msg: string) => void) | undefined,
    onDisponible: () => void
  ): void {
    this._cargando.set(true);

    if (!apodo) {
      onDisponible();
      return;
    }

    this.invitadoClient.obtenerInvitados().subscribe({
      next: (lista) => {
        const normalizado = apodo.trim().toLowerCase();
        const repetido = lista.some(
          (i) => i.id !== idActual && i.apodo.trim().toLowerCase() === normalizado
        );

        if (repetido) {
          this.notificarError(`El apodo "${apodo}" ya está en uso. Elegí otro.`, onError);
          return;
        }
        onDisponible();
      },
      error: () => this.notificarError('Error de conexión al verificar el apodo.', onError)
    });
  }

  private notificarError(mensaje: string, onError?: (msg: string) => void): void {
    this._cargando.set(false);
    if (onError) {
      onError(mensaje);
    } else {
      alert(mensaje);
    }
  }
}