import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ROUTE_SEGMENTS } from '../../../app.route.segments';
import { Encuesta } from '../../data-access/encuesta.model';
import { EncuestaStore } from '../../data-access/encuesta-store';

@Component({
  selector: 'app-encuesta-formulario',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './encuesta-formulario.html',
  styleUrl: './encuesta-formulario.css',
})
export class EncuestaFormulario implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  protected readonly encuestaStore = inject(EncuestaStore);

  protected readonly eventoId = signal<string | number>(1);
  protected readonly editandoEncuesta = signal<Encuesta | null>(null);
  protected readonly mensajeExito = signal<string | null>(null);
  protected readonly errorOpciones = signal<string | null>(null);

  readonly formulario: FormGroup<{
    pregunta: FormControl<string>;
    opciones: FormArray<FormControl<string>>;
  }>;

  constructor() {
    this.formulario = this.fb.group({
      pregunta: this.fb.control('', {
        nonNullable: true,
        validators: [Validators.required, Validators.minLength(3), Validators.maxLength(160)],
      }),
      opciones: this.fb.array<FormControl<string>>([], {
        validators: [Validators.minLength(2)],
      }),
    });

    this.resetearFormulario();
  }

  ngOnInit(): void {
    const idParam =
      this.route.snapshot.paramMap.get('eventoId') ||
      this.route.snapshot.parent?.paramMap.get('eventoId');
    const id = idParam ?? 1;
    this.eventoId.set(id);
    this.encuestaStore.cargarPorEvento(id);
  }

  get opcionesArray(): FormArray<FormControl<string>> {
    return this.formulario.controls.opciones;
  }

  agregarOpcion(valorInicial = ''): void {
    if (this.opcionesArray.length >= 8) return;
    this.opcionesArray.push(
      this.fb.control(valorInicial, {
        nonNullable: true,
        validators: [Validators.required, Validators.maxLength(80)],
      }),
    );
    this.errorOpciones.set(null);
  }

  quitarOpcion(indice: number): void {
    if (this.opcionesArray.length <= 2) return;
    this.opcionesArray.removeAt(indice);
    this.errorOpciones.set(null);
  }

  prepararEdicion(encuesta: Encuesta): void {
    this.mensajeExito.set(null);
    this.errorOpciones.set(null);
    this.editandoEncuesta.set(encuesta);

    this.formulario.controls.pregunta.setValue(encuesta.pregunta);
    this.formulario.controls.pregunta.markAsPristine();
    this.formulario.controls.pregunta.markAsUntouched();

    this.opcionesArray.clear();
    const opcionesBase = encuesta.opciones.length >= 2 ? encuesta.opciones : [];
    for (const op of opcionesBase) {
      this.agregarOpcion(op.texto);
    }
    while (this.opcionesArray.length < 2) {
      this.agregarOpcion('');
    }
  }

  cancelarEdicion(): void {
    this.editandoEncuesta.set(null);
    this.resetearFormulario();
  }

  resetearFormulario(): void {
    this.formulario.controls.pregunta.setValue('');
    this.formulario.controls.pregunta.markAsUntouched();
    this.formulario.controls.pregunta.markAsPristine();

    this.opcionesArray.clear();
    this.agregarOpcion('');
    this.agregarOpcion('');
    this.errorOpciones.set(null);
  }

  async guardar(): Promise<void> {
    this.mensajeExito.set(null);
    this.errorOpciones.set(null);

    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      this.opcionesArray.controls.forEach((ctrl) => ctrl.markAsTouched());
      return;
    }

    const textos = this.opcionesArray.controls.map((c) => c.value.trim()).filter(Boolean);
    const sinDuplicados = new Set(textos.map((t) => t.toLowerCase()));

    if (textos.length < 2) {
      this.errorOpciones.set('Ingresá al menos 2 opciones válidas.');
      return;
    }

    if (sinDuplicados.size !== textos.length) {
      this.errorOpciones.set('No puede haber opciones repetidas.');
      return;
    }

    const enEdicion = this.editandoEncuesta();

    if (enEdicion) {
      const ok = await this.encuestaStore.actualizarEncuesta(
        enEdicion,
        this.formulario.controls.pregunta.value,
        textos,
      );
      if (ok) {
        this.editandoEncuesta.set(null);
        this.resetearFormulario();
        this.mensajeExito.set('Encuesta modificada correctamente.');
      }
      return;
    }

    const ok = await this.encuestaStore.crearEncuesta(
      this.eventoId(),
      this.formulario.controls.pregunta.value,
      textos,
    );

    if (ok) {
      this.resetearFormulario();
      this.mensajeExito.set('Encuesta creada correctamente.');
    }
  }

  async eliminar(encuesta: Encuesta): Promise<void> {
    if (!encuesta.id) return;

    const confirmacion = confirm(
      `¿Querés eliminar la encuesta "${encuesta.pregunta}"? Se quitará del evento.`,
    );
    if (!confirmacion) return;

    this.mensajeExito.set(null);
    const ok = await this.encuestaStore.eliminarEncuesta(encuesta.id);
    if (ok) {
      if (this.editandoEncuesta()?.id === encuesta.id) {
        this.cancelarEdicion();
      }
      this.mensajeExito.set('Encuesta eliminada correctamente.');
    }
  }

  volverAlEvento(): void {
    this.router.navigate(['/', ROUTE_SEGMENTS.eventos, this.eventoId()]);
  }
}