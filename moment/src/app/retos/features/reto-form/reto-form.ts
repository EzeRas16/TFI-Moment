import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RetoService } from '../../data-access/reto.service';
import { Reto } from '../../data-access/reto.model';
import { forkJoin } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-reto-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reto-form.html',
  styleUrl: './reto-form.css'
})
export class RetoForm implements OnInit {
  private servicioReto = inject(RetoService);
  private readonly rutaActiva = inject(ActivatedRoute);

  descripcion = '';
  cargando = signal(false);
  mensajeError = signal('');
  mensajeExito = signal('');

  retos = signal<Reto[]>([]);
  seleccionados = signal<Set<number | string>>(new Set());
  eventoIdActual = signal<string | number | null>(null);
  cargandoLista = signal(false);
  eliminando = signal(false);

  desplegableListaAbierto = signal(false);
  desplegableAbierto = signal(false);

  retosVisibles = computed(() => {
    const lista = this.retos();
    const idEvento = this.eventoIdActual();

    if (idEvento === null || idEvento === undefined || idEvento === '') {
      return lista;
    }

    return lista.filter((reto) => String(reto.eventoId) === String(idEvento));
  });

  ngOnInit() {

    const idDesdeRuta = this.rutaActiva.snapshot.paramMap.get('eventoId');
    if (idDesdeRuta) {
    this.eventoIdActual.set(idDesdeRuta);
    }

    this.cargarRetos();
  }

  cargarRetos() {
    this.cargandoLista.set(true);
    this.servicioReto.obtenerRetos().subscribe({
      next: (data) => {
        this.retos.set(data);
        this.cargandoLista.set(false);
      },
      error: () => this.cargandoLista.set(false)
    });
  }

  alternarDesplegableLista() {
    this.desplegableListaAbierto.update(valor => !valor);
  }

  alternarDesplegable() {
    this.desplegableAbierto.update(valor => !valor);
  }

  guardarReto() {
    if (!this.descripcion.trim()) {
      this.mensajeError.set('Por favor, ingresa una descripción para el reto.');
      return;
    }

    this.cargando.set(true);
    this.mensajeError.set('');
    this.mensajeExito.set('');

    const idEvento = this.eventoIdActual();
    const nuevoReto: Omit<Reto, 'id'> = {
      descripcion: this.descripcion.trim(),
      ...(idEvento !== null ? { eventoId: idEvento } : {}),
    };

    this.servicioReto.crearReto(nuevoReto).subscribe({
      next: () => {
        this.cargando.set(false);
        this.mensajeExito.set('¡Reto guardado con exito!');
        this.descripcion = '';
        this.cargarRetos();
      },
      error: (err) => {
        this.cargando.set(false);
        console.error('Error al crear el reto:', err);
        this.mensajeError.set('No se pudo guardar el reto.');
      }
    });
  }

  alternarSeleccion(id: number | string) {
    const actual = new Set(this.seleccionados());
    if (actual.has(id)) {
      actual.delete(id);
    } else {
      actual.add(id);
    }
    this.seleccionados.set(actual);
  }

  confirmarEliminacion() {
    if (this.seleccionados().size === 0) return;

    if (confirm(`¿Estás seguro de eliminar los ${this.seleccionados().size} retos seleccionados?`)) {
      this.eliminando.set(true);

      const peticiones = Array.from(this.seleccionados()).map(id => this.servicioReto.eliminarReto(id));

      forkJoin(peticiones).subscribe({
        next: () => {
          this.eliminando.set(false);
          this.seleccionados.set(new Set());
          this.cargarRetos();
        },
        error: (err) => {
          this.eliminando.set(false);
          console.error('Error al eliminar retos:', err);
        }
      });
    }
  }
}