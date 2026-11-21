import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { MesaClient } from '../../data-access/mesa-client';
import { MesaStore } from '../../data-access/mesa-store';
import { ROUTE_SEGMENTS } from '../../../app.route.segments';

interface MesaFormState {
  numero: number | null;
  capacidad: number;
  activa: boolean;
}

@Component({
  selector: 'app-mesa-formulario',
  standalone: true,
  imports: [],
  templateUrl: './mesa-formulario.html',
  styleUrl: './mesa-formulario.css',
})
export class MesaFormulario implements OnInit {
  private readonly mesaClient = inject(MesaClient);
  protected readonly mesaStore = inject(MesaStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly editandoId = signal<string | number | null>(null);
  protected readonly eventoId = signal<string | number>(1);
  protected readonly guardando = signal<boolean>(false);

  readonly modelo = signal<MesaFormState>({
    numero: null,
    capacidad: 4,
    activa: true,
  });

  readonly tocados = signal<{ numero: boolean; capacidad: boolean }>({
    numero: false,
    capacidad: false,
  });

  readonly errorNumero = computed<string | null>(() => {
    const val = this.modelo().numero;
    if (val === null || val === undefined || Number.isNaN(Number(val))) {
      return 'El número de mesa es obligatorio.';
    }
    const num = Number(val);
    if (num < 1) {
      return 'El número de mesa debe ser mayor a 0.';
    }
    if (num > 150) {
      return 'El número de mesa no puede superar 150.';
    }
    const duplicada = this.mesaStore
      .mesas()
      .some((m) => Number(m.numero) === num && String(m.id) !== String(this.editandoId()));
    if (duplicada) {
      return '¡Ya existe una mesa con ese número en este evento!';
    }
    return null;
  });

  readonly errorCapacidad = computed<string | null>(() => {
    const cap = Number(this.modelo().capacidad);
    if (!cap || Number.isNaN(cap) || cap < 1 || cap > 12) {
      return 'Ingresá una capacidad válida (entre 1 y 12).';
    }
    return null;
  });

  readonly formularioValido = computed<boolean>(
    () => this.errorNumero() === null && this.errorCapacidad() === null,
  );

  async ngOnInit(): Promise<void> {
    const idEvento =
      this.route.snapshot.paramMap.get('eventoId') ||
      this.route.snapshot.parent?.paramMap.get('eventoId') ||
      1;
    this.eventoId.set(idEvento);

    if (this.mesaStore.mesas().length === 0) {
      await this.mesaStore.cargarMesasPorEvento(idEvento);
    }

    const idMesa = this.route.snapshot.paramMap.get('id');
    if (idMesa) {
      this.editandoId.set(idMesa);
      try {
        const mesa = await firstValueFrom(this.mesaClient.getMesaById(idMesa));
        this.modelo.set({
          numero: mesa.numero,
          capacidad: mesa.capacidad ?? 4,
          activa: mesa.activa,
        });
      } catch (err) {
        console.error('Error al cargar mesa para editar', err);
      }
    }
  }

  onNumeroInput(event: Event): void {
    const raw = (event.target as HTMLInputElement).value;
    const parsed = raw === '' ? null : Number(raw);
    this.modelo.update((m) => ({ ...m, numero: parsed }));
  }

  onCapacidadInput(event: Event): void {
    const raw = (event.target as HTMLInputElement).value;
    const parsed = raw === '' ? 0 : Number(raw);
    this.modelo.update((m) => ({ ...m, capacidad: parsed }));
  }

  onActivaChange(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.modelo.update((m) => ({ ...m, activa: checked }));
  }

  marcarTocado(campo: 'numero' | 'capacidad'): void {
    this.tocados.update((t) => ({ ...t, [campo]: true }));
  }

  async guardar(event: Event): Promise<void> {
    event.preventDefault();
    this.tocados.set({ numero: true, capacidad: true });

    if (!this.formularioValido() || this.guardando()) return;

    this.guardando.set(true);
    const actual = this.modelo();
    const payload = {
      numero: Number(actual.numero),
      capacidad: Number(actual.capacidad),
      activa: actual.activa,
      eventoId: this.eventoId(),
    };

    try {
      const idActual = this.editandoId();
      if (idActual !== null) {
        await this.mesaStore.actualizarMesa(idActual, payload);
      } else {
        await this.mesaStore.crearMesa(payload);
      }
      await this.volverALista();
    } catch (err) {
      console.error('Error al guardar mesa', err);
    } finally {
      this.guardando.set(false);
    }
  }

  async volverALista(): Promise<void> {
    await this.router.navigate([
      '/',
      ROUTE_SEGMENTS.eventos,
      this.eventoId(),
      ROUTE_SEGMENTS.mesas,
      'gestion',
    ]);
  }
}