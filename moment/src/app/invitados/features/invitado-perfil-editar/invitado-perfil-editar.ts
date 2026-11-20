import { Component, OnInit, computed, inject, input, output, signal } from '@angular/core';
import { InvitadoStore } from '../../data-access/invitado-store';
import { Invitado } from '../../data-access/invitado.model';

@Component({
  selector: 'app-invitado-perfil-editar',
  standalone: true,
  imports: [],
  templateUrl: './invitado-perfil-editar.html',
  styleUrl: './invitado-perfil-editar.css',
})
export class InvitadoPerfilEditar implements OnInit {
  readonly store = inject(InvitadoStore);

  readonly invitado = input.required<Invitado>();
  readonly guardado = output<Invitado>();
  readonly cancelar = output<void>();

  readonly errorMensaje = signal<string | null>(null);
  readonly modelo = signal<{ nombre: string; apodo: string }>({
    nombre: '',
    apodo: '',
  });
  readonly tocados = signal<{ nombre: boolean; apodo: boolean }>({
    nombre: false,
    apodo: false,
  });

  readonly errorNombre = computed<string | null>(() =>
    this.modelo().nombre.trim().length < 2
      ? 'El nombre es obligatorio (mínimo 2 letras).'
      : null,
  );

  readonly errorApodo = computed<string | null>(() =>
    this.modelo().apodo.trim().length < 2
      ? 'El apodo es obligatorio (mínimo 2 letras).'
      : null,
  );

  readonly formularioValido = computed<boolean>(
    () => this.errorNombre() === null && this.errorApodo() === null,
  );

  ngOnInit(): void {
    const actual = this.invitado();
    this.modelo.set({
      nombre: actual.nombre,
      apodo: actual.apodo,
    });
  }

  onCampoInput(campo: 'nombre' | 'apodo', event: Event): void {
    const valor = (event.target as HTMLInputElement).value;
    this.modelo.update((m) => ({ ...m, [campo]: valor }));
  }

  marcarTocado(campo: 'nombre' | 'apodo'): void {
    this.tocados.update((t) => ({ ...t, [campo]: true }));
  }

  guardarCambiosPerfil(event: Event): void {
    event.preventDefault();
    this.tocados.set({ nombre: true, apodo: true });

    const actual = this.invitado();
    if (actual.id === undefined || !this.formularioValido()) return;

    this.errorMensaje.set(null);

    const datosActualizados: Partial<Invitado> = {
      nombre: this.modelo().nombre.trim(),
      apodo: this.modelo().apodo.trim(),
    };

    this.store.actualizarInvitado(
      actual.id,
      datosActualizados,
      (actualizado) => {
        localStorage.setItem('invitado_actual', JSON.stringify(actualizado));
        this.guardado.emit(actualizado);
      },
      (msgError) => this.errorMensaje.set(msgError),
    );
  }
}