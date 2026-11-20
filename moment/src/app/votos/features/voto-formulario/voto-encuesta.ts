import { Component, OnDestroy, OnInit, effect, inject, input, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Encuesta } from '../../../encuestas/data-access/encuesta.model';
import { VotoStore } from '../../data-access/voto-store';

@Component({
  selector: 'app-votar-encuesta',
  standalone: true,
  imports: [],
  templateUrl: './voto-encuesta.html',
  styleUrl: './voto-encuesta.css',
})
export class VotarEncuesta implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  readonly store = inject(VotoStore);

  readonly mesaId = input<string | number | undefined>(undefined);
  readonly eventoId = input<string | number | undefined>(undefined);

  readonly mesaActivaId = signal<string | number | null>(null);
  readonly mensajeExito = signal<string | null>(null);

  private pollingId: ReturnType<typeof setInterval> | null = null;

  constructor() {
    // Si cambia el mesaId o eventoId desde el padre, re-sincronizamos
    effect(() => {
      const idParam = this.route.snapshot.paramMap.get('mesaId');
      const resolvedMesaId = this.mesaId() ?? idParam ?? null;
      this.mesaActivaId.set(resolvedMesaId);
    });
  }

  ngOnInit(): void {
    this.refrescarEncuestas();

    this.pollingId = setInterval(() => {
      this.refrescarEncuestas();
    }, 3000);
  }

  ngOnDestroy(): void {
    if (this.pollingId) {
      clearInterval(this.pollingId);
      this.pollingId = null;
    }
  }

  private refrescarEncuestas(): void {
    const idMesa = this.mesaActivaId();
    if (idMesa !== null && idMesa !== '') {
      this.store.cargarPorMesa(idMesa, this.eventoId());
    }
  }

  async onVotar(encuesta: Encuesta, opcionId: string): Promise<void> {
    const idMesa = this.mesaActivaId();
    if (!idMesa) return;

    this.mensajeExito.set(null);
    const ok = await this.store.votar(idMesa, encuesta, opcionId);
    if (ok) {
      this.mensajeExito.set('¡Voto registrado para la mesa!');
      this.refrescarEncuestas();
    }
  }
}