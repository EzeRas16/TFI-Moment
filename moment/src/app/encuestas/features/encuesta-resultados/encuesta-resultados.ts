import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ROUTE_SEGMENTS } from '../../../app.route.segments';
import { Encuesta, OpcionEncuesta } from '../../data-access/encuesta.model';
import { EncuestaStore } from '../../data-access/encuesta-store';

@Component({
  selector: 'app-encuesta-resultados',
  standalone: true,
  imports: [],
  templateUrl: './encuesta-resultados.html',
  styleUrl: './encuesta-resultados.css',
})
export class EncuestaResultados implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  protected readonly store = inject(EncuestaStore);

  protected readonly eventoId = signal<string | number>(1);
  protected readonly ultimaActualizacion = signal<Date | null>(null);
  private intervaloPolling: ReturnType<typeof setInterval> | null = null;

  ngOnInit(): void {
    const idParam =
      this.route.snapshot.paramMap.get('eventoId') ||
      this.route.snapshot.parent?.paramMap.get('eventoId') ||
      1;
    this.eventoId.set(idParam);

    this.refrescarResultados();

    // Actualización en tiempo real cada 3 segundos
    this.intervaloPolling = setInterval(() => {
      this.refrescarResultados();
    }, 3000);
  }

  ngOnDestroy(): void {
    if (this.intervaloPolling) {
      clearInterval(this.intervaloPolling);
      this.intervaloPolling = null;
    }
  }

  async refrescarResultados(): Promise<void> {
    await this.store.cargarPorEvento(this.eventoId());
    this.ultimaActualizacion.set(new Date());
  }

  totalVotos(encuesta: Encuesta): number {
    return encuesta.opciones.reduce((acc, op) => acc + (op.votos ?? 0), 0);
  }

  porcentajeOpcion(encuesta: Encuesta, opcion: OpcionEncuesta): number {
    const total = this.totalVotos(encuesta);
    if (total === 0) return 0;
    return Math.round(((opcion.votos ?? 0) / total) * 100);
  }

  maxVotos(encuesta: Encuesta): number {
    if (encuesta.opciones.length === 0) return 0;
    return Math.max(...encuesta.opciones.map((op) => op.votos ?? 0));
  }

  esGanadora(encuesta: Encuesta, opcion: OpcionEncuesta): boolean {
    const max = this.maxVotos(encuesta);
    return max > 0 && (opcion.votos ?? 0) === max;
  }

  textoGanador(encuesta: Encuesta): string {
    const max = this.maxVotos(encuesta);
    if (max === 0) return 'Sin votos registrados aún';

    const ganadoras = encuesta.opciones.filter((op) => (op.votos ?? 0) === max);
    if (ganadoras.length === 1) {
      return `Opción ganadora: ${ganadoras[0].texto} (${max} ${max === 1 ? 'voto' : 'votos'})`;
    }

    const nombres = ganadoras.map((g) => g.texto).join(' / ');
    return `Empate parcial: ${nombres} (${max} ${max === 1 ? 'voto' : 'votos'} c/u)`;
  }

  irAGestionEncuestas(): void {

    this.router.navigate([
      '/',
      ROUTE_SEGMENTS.eventos,
      this.eventoId(),
      ROUTE_SEGMENTS.encuestas,
      'gestion',
    ]);
  }

  volverAlEvento(): void {
    this.router.navigate(['/', ROUTE_SEGMENTS.eventos, this.eventoId()]);
  }
}