import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { InvitadoStore } from '../../data-access/invitado-store';
import { Invitado } from '../../data-access/invitado.model';
import { InvitadoSalaMesa } from '../invitado-sala-mesa/invitado-sala-mesa';

@Component({
  selector: 'app-invitado-formulario',
  standalone: true,
  imports: [InvitadoSalaMesa],
  templateUrl: './invitado-formulario.html',
  styleUrl: './invitado-formulario.css',
})
export class InvitadoFormulario implements OnInit {
  private readonly route = inject(ActivatedRoute);
  readonly store = inject(InvitadoStore);

  readonly invitadoActual = signal<Invitado | null>(null);
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

  mesaToken = '';

  ngOnInit(): void {
    const tokenParam = this.route.snapshot.paramMap.get('token');
    const tokenQuery = this.route.snapshot.queryParamMap.get('token');
    this.mesaToken = tokenParam || tokenQuery || '';

    const guardado = localStorage.getItem('invitado_actual');
    if (!guardado) return;

    try {
      const invitadoParsed: Invitado = JSON.parse(guardado);
      const mismaMesa = this.mesaToken
        ? String(invitadoParsed.mesaId) === String(this.mesaToken)
        : Boolean(invitadoParsed.mesaId);

      if (mismaMesa) {
        this.invitadoActual.set(invitadoParsed);
      }
    } catch {
      localStorage.removeItem('invitado_actual');
    }
  }

  onCampoInput(campo: 'nombre' | 'apodo', event: Event): void {
    const valor = (event.target as HTMLInputElement).value;
    this.modelo.update((m) => ({ ...m, [campo]: valor }));
  }

  marcarTocado(campo: 'nombre' | 'apodo'): void {
    this.tocados.update((t) => ({ ...t, [campo]: true }));
  }

  onSubmit(event: Event): void {
    event.preventDefault();
    this.errorMensaje.set(null);
    this.tocados.set({ nombre: true, apodo: true });

    if (!this.formularioValido()) return;

    if (!this.mesaToken) {
      this.errorMensaje.set(
        'No se detectó una mesa válida. Por favor, volvé a escanear el código QR.',
      );
      return;
    }

    const nuevoInvitado: Invitado = {
      nombre: this.modelo().nombre.trim(),
      apodo: this.modelo().apodo.trim(),
      mesaId: this.mesaToken,
    };

    this.store.registrarInvitado(
      nuevoInvitado,
      (creado) => {
        localStorage.setItem('invitado_actual', JSON.stringify(creado));
        this.invitadoActual.set(creado);
        this.modelo.set({ nombre: '', apodo: '' });
        this.tocados.set({ nombre: false, apodo: false });
      },
      (msgError) => this.errorMensaje.set(msgError),
    );
  }

  onInvitadoActualizado(actualizado: Invitado): void {
    this.invitadoActual.set(actualizado);
  }

  onSalirDeLaMesa(): void {
    this.invitadoActual.set(null);
    this.errorMensaje.set(null);
  }
}