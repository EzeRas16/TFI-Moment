import { Component, inject, input, OnInit, output, signal } from '@angular/core';
import { EventoClient } from '../../data-access/evento-client';
import { ESTADOS, Evento, eventoFormulario, TIPOS } from '../../data-access/evento.model';
import { form, FormField, FormRoot, required} from '@angular/forms/signals';
import { firstValueFrom } from 'rxjs'; 

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

      // aqui falta crear validaciones para fecha por ejemplo que la fecha no sea menor a la fecha actual 
      // por ej que solo deje crear con 6 meses o un año de anticipacion

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
            const resultado = await firstValueFrom(this.servicio.crearEvento(valores));
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


