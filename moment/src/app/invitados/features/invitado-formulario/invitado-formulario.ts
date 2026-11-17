import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { InvitadoStore } from '../../data-access/invitado-store';
import { Invitado } from '../../data-access/invitado.model';

@Component({
  selector: 'app-invitado-formulario',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './invitado-formulario.html',
  styleUrl: './invitado-formulario.css'
})
export class InvitadoFormulario implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  readonly store = inject(InvitadoStore);

  // Estado B: Si tiene un invitado, muestra la tarjeta de bienvenida; si es null, muestra el formulario (Estado A)
  readonly invitadoActual = signal<Invitado | null>(null);
  readonly errorMensaje = signal<string | null>(null);

  form: FormGroup = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(2)]],
    apodo: ['', [Validators.required, Validators.minLength(2)]]
  });

  mesaToken: string = '';

  ngOnInit(): void {
    const tokenParam = this.route.snapshot.paramMap.get('token');
    const tokenQuery = this.route.snapshot.queryParamMap.get('token');
    this.mesaToken = tokenParam || tokenQuery || '';

    // Verificamos si este dispositivo ya se registró previamente en esta mesa
    const guardado = localStorage.getItem('invitado_actual');
    if (guardado) {
      const invitadoParsed: Invitado = JSON.parse(guardado);
      if (invitadoParsed.mesaId === this.mesaToken) {
        this.invitadoActual.set(invitadoParsed);
      }
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

    // Llamamos al Store pasando el callback onSuccess que ya tenías preparado
    this.store.registrarInvitado(nuevoInvitado, (creado) => {
      localStorage.setItem('invitado_actual', JSON.stringify(creado));
      this.invitadoActual.set(creado);
      this.form.reset();
    });
  }

  // Método auxiliar útil para testear o si alguien cambia de celular/usuario
  salirDeLaMesa(): void {
    localStorage.removeItem('invitado_actual');
    this.invitadoActual.set(null);
  }
}