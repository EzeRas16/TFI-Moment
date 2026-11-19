import { inject, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { EncuestaClient } from './encuesta-client';
import { Encuesta, OpcionEncuesta } from './encuesta.model';

@Injectable({
  providedIn: 'root',
})
export class EncuestaStore {
  private readonly client = inject(EncuestaClient);

  private readonly _encuestas = signal<Encuesta[]>([]);
  private readonly _cargando = signal(false);
  private readonly _error = signal<string | null>(null);

  readonly encuestas = this._encuestas.asReadonly();
  readonly cargando = this._cargando.asReadonly();
  readonly error = this._error.asReadonly();

  async cargarPorEvento(eventoId: string | number): Promise<void> {
    this._cargando.set(true);
    this._error.set(null);

    try {
      const lista = await firstValueFrom(this.client.obtenerEncuestasPorEvento(eventoId));
      this._encuestas.set(lista);
    } catch {
      this._error.set('No se pudieron cargar las encuestas.');
    } finally {
      this._cargando.set(false);
    }
  }

  async crearEncuesta(
    eventoId: string | number,
    pregunta: string,
    textosOpciones: string[],
  ): Promise<boolean> {
    this._error.set(null);

    const opciones: OpcionEncuesta[] = textosOpciones
      .map((texto, i) => ({
        id: `op-${Date.now()}-${i + 1}`,
        texto: texto.trim(),
        votos: 0,
      }))
      .filter((op) => op.texto.length > 0);

    const nuevaEncuesta: Encuesta = {
      eventoId,
      pregunta: pregunta.trim(),
      opciones,
      activa: true,
      creadaEn: new Date().toISOString(),
    };

    try {
      const creada = await firstValueFrom(this.client.crearEncuesta(nuevaEncuesta));
      this._encuestas.update((actuales) => [...actuales, creada]);
      return true;
    } catch {
      this._error.set('No se pudo crear la encuesta. Revisá que json-server esté corriendo.');
      return false;
    }
  }
}