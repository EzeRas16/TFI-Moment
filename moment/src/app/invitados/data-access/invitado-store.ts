import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Invitado } from './invitado.model';
import { InvitadoClient } from './invitado-client';

@Injectable({
  providedIn: 'root'
})
export class InvitadoStore {
  private readonly invitadoClient = inject(InvitadoClient);
  private readonly http = inject(HttpClient);

  private readonly _cargando = signal<boolean>(false);
  readonly cargando = this._cargando.asReadonly();

  // MÉTODOS PÚBLICOS (Acciones)

  registrarInvitado(
    invitado: Invitado,
    onSuccess?: (nuevo: Invitado) => void,
    onError?: (mensaje: string) => void
  ): void {
    this._cargando.set(true);

    // 1. Obtenemos la lista actual de invitados para validar apodo y capacidad
    this.invitadoClient.obtenerInvitados().subscribe({
      next: (invitadosLista) => {
        // Validar apodo repetido
        if (invitado.apodo) {
          const normalizado = invitado.apodo.trim().toLowerCase();
          const repetido = invitadosLista.some(
            (i) => i.apodo.trim().toLowerCase() === normalizado
          );
          if (repetido) {
            this._cargando.set(false);
            const msg = `El apodo "${invitado.apodo}" ya está en uso. Elegí otro.`;
            if (onError) onError(msg);
            else alert(msg);
            return;
          }
        }

        if (!invitado.mesaId) {
          this.ejecutarCreacion(invitado, onSuccess, onError);
          return;
        }

        // 2. Consultamos las mesas para verificar la capacidad máxima configurada
        this.http.get<any[]>('http://localhost:3000/mesas').subscribe({
          next: (mesasLista) => {
            const mesaEncontrada = mesasLista.find(m => 
              String(m.id) === String(invitado.mesaId) || 
              (m.codigoQr && m.codigoQr.includes(String(invitado.mesaId)))
            );

            if (!mesaEncontrada) {
              this._cargando.set(false);
              const msg = 'La mesa especificada no existe.';
              if (onError) onError(msg);
              else alert(msg);
              return;
            }

            // 3. Contamos cuántos ocupantes hay actualmente en esta mesa
            const ocupantesActuales = invitadosLista.filter(i => 
              String(i.mesaId) === String(invitado.mesaId) || 
              String(i.mesaId) === String(mesaEncontrada.id)
            ).length;

            // 4. Si la cantidad de ocupantes ya alcanzó o superó la capacidad, FRENAMOS EL ALTA
            if (ocupantesActuales >= mesaEncontrada.capacidad) {
              this._cargando.set(false);
              const msg = `¡Lo sentimos! La Mesa Nº ${mesaEncontrada.numero} ya está completa (${ocupantesActuales}/${mesaEncontrada.capacidad}). No se admiten más invitados.`;
              if (onError) onError(msg);
              else alert(msg);
              return;
            }

            // 5. Si hay lugar, procedemos a guardar el invitado
            this.ejecutarCreacion(invitado, onSuccess, onError);
          },
          error: () => {
            this._cargando.set(false);
            const msg = 'Error al verificar la capacidad de la mesa.';
            if (onError) onError(msg);
            else alert(msg);
          }
        });
      },
      error: () => {
        this._cargando.set(false);
        const msg = 'Error de conexión al validar el registro.';
        if (onError) onError(msg);
        else alert(msg);
      }
    });
  }

  private ejecutarCreacion(
    invitado: Invitado,
    onSuccess?: (nuevo: Invitado) => void,
    onError?: (mensaje: string) => void
  ): void {
    this.invitadoClient.crearInvitado(invitado).subscribe({
      next: (nuevo) => {
        this._cargando.set(false);
        if (onSuccess) onSuccess(nuevo);
      },
      error: () => {
        this._cargando.set(false);
        const msg = 'No se pudo completar el registro.';
        if (onError) onError(msg);
        else alert(msg);
      }
    });
  }

  actualizarInvitado(
    id: string | number,
    datos: Partial<Invitado>,
    onSuccess?: (actualizado: Invitado) => void,
    onError?: (mensaje: string) => void
  ): void {
    this.validarApodoDisponible(datos.apodo, id, onError, () => {
      this._cargando.set(true);
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
}import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Invitado } from './invitado.model';
import { InvitadoClient } from './invitado-client';

@Injectable({
  providedIn: 'root'
})
export class InvitadoStore {
  private readonly invitadoClient = inject(InvitadoClient);
  private readonly http = inject(HttpClient);

  private readonly _cargando = signal<boolean>(false);
  readonly cargando = this._cargando.asReadonly();

  // MÉTODOS PÚBLICOS (Acciones)

  registrarInvitado(
    invitado: Invitado,
    onSuccess?: (nuevo: Invitado) => void,
    onError?: (mensaje: string) => void
  ): void {
    this._cargando.set(true);

    // 1. Obtenemos la lista actual de invitados para validar apodo y capacidad
    this.invitadoClient.obtenerInvitados().subscribe({
      next: (invitadosLista) => {
        // Validar apodo repetido
        if (invitado.apodo) {
          const normalizado = invitado.apodo.trim().toLowerCase();
          const repetido = invitadosLista.some(
            (i) => i.apodo.trim().toLowerCase() === normalizado
          );
          if (repetido) {
            this._cargando.set(false);
            const msg = `El apodo "${invitado.apodo}" ya está en uso. Elegí otro.`;
            if (onError) onError(msg);
            else alert(msg);
            return;
          }
        }

        if (!invitado.mesaId) {
          this.ejecutarCreacion(invitado, onSuccess, onError);
          return;
        }

        // 2. Consultamos las mesas para verificar la capacidad máxima configurada
        this.http.get<any[]>('http://localhost:3000/mesas').subscribe({
          next: (mesasLista) => {
            const mesaEncontrada = mesasLista.find(m => 
              String(m.id) === String(invitado.mesaId) || 
              (m.codigoQr && m.codigoQr.includes(String(invitado.mesaId)))
            );

            if (!mesaEncontrada) {
              this._cargando.set(false);
              const msg = 'La mesa especificada no existe.';
              if (onError) onError(msg);
              else alert(msg);
              return;
            }

            // 3. Contamos cuántos ocupantes hay actualmente en esta mesa
            const ocupantesActuales = invitadosLista.filter(i => 
              String(i.mesaId) === String(invitado.mesaId) || 
              String(i.mesaId) === String(mesaEncontrada.id)
            ).length;

            // 4. Si la cantidad de ocupantes ya alcanzó o superó la capacidad, FRENAMOS EL ALTA
            if (ocupantesActuales >= mesaEncontrada.capacidad) {
              this._cargando.set(false);
              const msg = `¡Lo sentimos! La Mesa Nº ${mesaEncontrada.numero} ya está completa (${ocupantesActuales}/${mesaEncontrada.capacidad}). No se admiten más invitados.`;
              if (onError) onError(msg);
              else alert(msg);
              return;
            }

            // 5. Si hay lugar, procedemos a guardar el invitado
            this.ejecutarCreacion(invitado, onSuccess, onError);
          },
          error: () => {
            this._cargando.set(false);
            const msg = 'Error al verificar la capacidad de la mesa.';
            if (onError) onError(msg);
            else alert(msg);
          }
        });
      },
      error: () => {
        this._cargando.set(false);
        const msg = 'Error de conexión al validar el registro.';
        if (onError) onError(msg);
        else alert(msg);
      }
    });
  }

  private ejecutarCreacion(
    invitado: Invitado,
    onSuccess?: (nuevo: Invitado) => void,
    onError?: (mensaje: string) => void
  ): void {
    this.invitadoClient.crearInvitado(invitado).subscribe({
      next: (nuevo) => {
        this._cargando.set(false);
        if (onSuccess) onSuccess(nuevo);
      },
      error: () => {
        this._cargando.set(false);
        const msg = 'No se pudo completar el registro.';
        if (onError) onError(msg);
        else alert(msg);
      }
    });
  }

  actualizarInvitado(
    id: string | number,
    datos: Partial<Invitado>,
    onSuccess?: (actualizado: Invitado) => void,
    onError?: (mensaje: string) => void
  ): void {
    this.validarApodoDisponible(datos.apodo, id, onError, () => {
      this._cargando.set(true);
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