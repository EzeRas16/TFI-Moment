import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { InvitadoStore } from '../../data-access/invitado-store';
import { Invitado } from '../../data-access/invitado.model';
import { VotarEncuesta } from '../../../votos/features/voto-formulario/voto-encuesta';


@Component({
  selector: 'app-invitado-formulario',
  standalone: true,
  imports: [ReactiveFormsModule, VotarEncuesta],
  templateUrl: './invitado-formulario.html',
  styleUrl: './invitado-formulario.css'
})
export class InvitadoFormulario implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  readonly store = inject(InvitadoStore);

  readonly invitadoActual = signal<Invitado | null>(null);
  readonly editandoPerfil = signal<boolean>(false);
  readonly errorMensaje = signal<string | null>(null);

  form: FormGroup = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(2)]],
    apodo: ['', [Validators.required, Validators.minLength(2)]]
  });

  // Formulario separado para la edición del perfil en el Estado B
  formEdicion: FormGroup = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(2)]],
    apodo: ['', [Validators.required, Validators.minLength(2)]]
  });

  mesaToken: string = '';

  ngOnInit(): void {
  const tokenParam = this.route.snapshot.paramMap.get('token');
  const tokenQuery = this.route.snapshot.queryParamMap.get('token');
  this.mesaToken = tokenParam || tokenQuery || '';

  const guardado = localStorage.getItem('invitado_actual');
  if (!guardado) return;

  try {
    const invitadoParsed: Invitado = JSON.parse(guardado);

    const mismaMesa =
      this.mesaToken
        ? String(invitadoParsed.mesaId) === String(this.mesaToken)
        : Boolean(invitadoParsed.mesaId);

    if (mismaMesa) {
      this.invitadoActual.set(invitadoParsed);
    }
  } catch {
    localStorage.removeItem('invitado_actual');
  }
}

  onSubmit(): void {
    this.errorMensaje.set(null);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (!this.mesaToken) {
      this.errorMensaje.set('No se detectó una mesa válida. Por favor, volvé a escanear el código QR.');
      return;
    }

    const nuevoInvitado: Invitado = {
      nombre: this.form.value.nombre.trim(),
      apodo: this.form.value.apodo.trim(),
      mesaId: this.mesaToken
    };

    // Delegamos toda la lógica de validación de cupos y apodos al Store
    this.store.registrarInvitado(
      nuevoInvitado,
      (creado) => {
        localStorage.setItem('invitado_actual', JSON.stringify(creado));
        this.invitadoActual.set(creado);
        this.form.reset();
      },
      (msgError) => this.errorMensaje.set(msgError)
    );
  }

  activarEdicion(): void {
    const actual = this.invitadoActual();
    if (!actual) return;

    this.errorMensaje.set(null);
    this.formEdicion.patchValue({
      nombre: actual.nombre,
      apodo: actual.apodo
    });
    this.editandoPerfil.set(true);
  }

  cancelarEdicion(): void {
    this.errorMensaje.set(null);
    this.editandoPerfil.set(false);
    this.formEdicion.reset();
  }

  guardarCambiosPerfil(): void {
    const actual = this.invitadoActual();
    if (!actual || actual.id === undefined) return;

    this.errorMensaje.set(null);

    if (this.formEdicion.invalid) {
      this.formEdicion.markAllAsTouched();
      return;
    }

    const datosActualizados: Partial<Invitado> = {
      nombre: this.formEdicion.value.nombre.trim(),
      apodo: this.formEdicion.value.apodo.trim()
    };

    this.store.actualizarInvitado(
      actual.id,
      datosActualizados,
      (actualizado) => {
        localStorage.setItem('invitado_actual', JSON.stringify(actualizado));
        this.invitadoActual.set(actualizado);
        this.editandoPerfil.set(false);
      },
      (msgError) => this.errorMensaje.set(msgError)
    );
  }

  salirDeLaMesa(): void {
    localStorage.removeItem('invitado_actual');
    this.invitadoActual.set(null);
    this.editandoPerfil.set(false);
    this.errorMensaje.set(null);
  }
}