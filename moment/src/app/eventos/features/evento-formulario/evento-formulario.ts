import { Component, inject, input, OnInit, output, signal } from '@angular/core';
import { EventoClient } from '../../data-access/evento-client';
import {
  ESTADOS,
  Evento,
  eventoFormulario,
  TIPOS,
  eventoNuevo,
} from '../../data-access/evento.model';
import { form, FormField, FormRoot, required, validate } from '@angular/forms/signals';
import { firstValueFrom } from 'rxjs';
import {
  buscarProblemaDeFecha,
  FECHA_MAXIMA_DEL_EVENTO,
  FECHA_MINIMA_DEL_EVENTO,
} from '../../data-access/evento-validacionesFecha';

@Component({
  imports: [FormField, FormRoot],
  selector: 'app-evento-formulario',
  styleUrl: './evento-formulario.css',
  templateUrl: './evento-formulario.html',
})
export class EventoFormulario implements OnInit {
  private readonly servicio = inject(EventoClient);
  protected readonly tipos = TIPOS;
  protected readonly estados = ESTADOS;

  protected readonly fechaMinima = FECHA_MINIMA_DEL_EVENTO();
  protected readonly fechaMaxima = FECHA_MAXIMA_DEL_EVENTO();

  readonly aEditar = input<Evento>();
  readonly aCargar = output<Evento>();

  protected readonly formularioVacio: eventoFormulario = {
    nombre: '',
    fecha: '',
    tipo: '',
  };

  protected readonly modelo = signal<eventoFormulario>({ ...this.formularioVacio });

  ngOnInit() {
    const e = this.aEditar();
    if (e) this.modelo.set(e);
  }

  readonly formu = form(
    this.modelo,
    (e) => {
      required(e.nombre, { message: 'El nombre es obligatorio' });
      required(e.fecha, { message: 'La fecha es obligatoria' });
      required(e.tipo, { message: 'El tipo es obligatorio' });

      validate(e.fecha, ({ value }) => {
        const problema = buscarProblemaDeFecha(value(), this.aEditar()?.fecha);
        return problema ?? undefined;
      });
    },
    {
      submission: {
        action: async (campo) => {
          const valores = campo().value();
          const actual = this.aEditar();

          if (actual) {
            if (!confirm('¿Desea actualizar el evento?')) return;
            const resultado = await firstValueFrom(
              this.servicio.actualizarEvento(actual.id, valores),
            );
            alert('Evento actualizado correctamente');
            this.aCargar.emit(resultado);
          } else {
            const usuarioId = 1; // esto es temporal, tengo que poder obtener el id del usuario en sesion
            const nuevoEvento: eventoNuevo = {
              ...valores,
              usuarioId,
              estado: ESTADOS[0], // 'Pendiente'
            };
            const resultado = await firstValueFrom(this.servicio.crearEvento(nuevoEvento));
            alert('Evento creado correctamente');
            this.aCargar.emit(resultado);
            this.limpiarFormulario();
          }
        },
        onInvalid: () => {
          alert('El formulario tiene errores, por favor verifique los campos');
        },
      },
    },
  );

  limpiarFormulario() {
    this.formu().reset({ ...this.formularioVacio });
  }
}
