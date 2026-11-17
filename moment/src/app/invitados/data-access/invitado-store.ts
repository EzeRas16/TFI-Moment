import { Injectable, inject, signal } from '@angular/core';
import { Invitado } from './invitado.model';
import { InvitadoClient } from './invitado-client';

@Injectable({
  providedIn: 'root'
})

export class InvitadoStore {
  private invitadoClient = inject(InvitadoClient);

  private _cargando = signal<boolean>(false);
  readonly cargando = this._cargando.asReadonly();

  registrarInvitado(invitado: Invitado, onSuccess?: (nuevo: Invitado) => void): void {
    this._cargando.set(true);
    this.invitadoClient.crearInvitado(invitado).subscribe({
      next: (nuevo) => {
        this._cargando.set(false);
        if (onSuccess) onSuccess(nuevo);
      },
      error: (err) => {
        console.error('Error al registrar invitado', err);
        this._cargando.set(false);
        alert('No se pudo completar el registro. Intentá nuevamente.');
      }
    });
  }

  
}