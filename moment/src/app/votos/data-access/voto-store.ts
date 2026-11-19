import { computed, inject, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Encuesta, OpcionEncuesta } from '../../encuestas/data-access/encuesta.model';
import { VotoClient } from './voto-client';
import { Voto } from './voto.model';

@Injectable({
  providedIn: 'root',
})
export class VotoStore {
  private readonly client = inject(VotoClient);

  private readonly _encuestas = signal<Encuesta[]>([]);
  private readonly _votosMesa = signal<Voto[]>([]);
  private readonly _cargando = signal<boolean>(false);
  private readonly _votandoEncuestaId = signal<string | number | null>(null);
  private readonly _error = signal<string | null>(null);

  readonly encuestas = this._encuestas.asReadonly();
  readonly votosMesa = this._votosMesa.asReadonly();
  readonly cargando = this._cargando.asReadonly();
  readonly votandoEncuestaId = this._votandoEncuestaId.asReadonly();
  readonly error = this._error.asReadonly();

  readonly encuestasActivas = computed(() =>
    this._encuestas().filter((enc) => enc.activa),
  );

  async cargarPorMesa(mesaId: string | number, eventoId?: string | number): Promise<void> {
    this._cargando.set(true);
    this._error.set(null);

    try {
      const [encuestasResp, votosResp] = await Promise.all([
        firstValueFrom(this.client.obtenerEncuestasActivas()),
        firstValueFrom(this.client.obtenerVotosPorMesa(mesaId)),
      ]);

      const filtradas = eventoId
        ? encuestasResp.filter((e) => String(e.eventoId) === String(eventoId))
        : encuestasResp;

      this._encuestas.set(filtradas);
      this._votosMesa.set(votosResp);
    } catch {
      this._error.set('No se pudieron cargar las encuestas activas.');
    } finally {
      this._cargando.set(false);
    }
  }

  opcionVotadaPorMesa(encuestaId: string | number | undefined): string | undefined {
    if (encuestaId === undefined) return undefined;
    const encontrado = this._votosMesa().find((v) => String(v.encuestaId) === String(encuestaId));
    return encontrado?.opcionId;
  }

  async votar(
    mesaId: string | number,
    encuesta: Encuesta,
    opcionId: string,
  ): Promise<boolean> {
    if (!encuesta.id || !encuesta.activa) {
      this._error.set('Esta encuesta no está activa.');
      return false;
    }

    if (this.opcionVotadaPorMesa(encuesta.id)) {
      this._error.set('Esta mesa ya registró su voto en esta encuesta.');
      return false;
    }

    this._error.set(null);
    this._votandoEncuestaId.set(encuesta.id);

    const opcionesActualizadas: OpcionEncuesta[] = encuesta.opciones.map((op) =>
      op.id === opcionId ? { ...op, votos: (op.votos ?? 0) + 1 } : op,
    );

    const encuestaActualizada: Encuesta = {
      ...encuesta,
      opciones: opcionesActualizadas,
    };

    const nuevoVoto: Voto = {
      mesaId,
      encuestaId: encuesta.id,
      opcionId,
      creadoEn: new Date().toISOString(),
    };

    try {
      const votoCreado = await firstValueFrom(this.client.registrarVoto(nuevoVoto));
      const encuestaGuardada = await firstValueFrom(
        this.client.actualizarEncuesta(encuesta.id, encuestaActualizada),
      );

      this._votosMesa.update((actuales) => [...actuales, votoCreado]);
      this._encuestas.update((actuales) =>
        actuales.map((e) => (e.id === encuesta.id ? encuestaGuardada : e)),
      );
      return true;
    } catch {
      this._error.set('No se pudo registrar el voto. Revisá que json-server esté activo.');
      return false;
    } finally {
      this._votandoEncuestaId.set(null);
    }
  }
}