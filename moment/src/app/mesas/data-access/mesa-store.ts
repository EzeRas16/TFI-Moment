import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { MesaClient } from './mesa-client';
import { Mesa, MesaFormulario } from './mesa.model';

@Injectable({
  providedIn: 'root',
})


export class MesaStore {
  private readonly client = inject(MesaClient);

  // Estado reactivo (Signals)
  readonly mesas = signal<Mesa[]>([]);
  readonly cargando = signal<boolean>(false);

  async cargarMesasPorEvento(eventoId: string | number): Promise<void> {
    this.cargando.set(true);
    try {
      const lista = await firstValueFrom(this.client.getMesasPorEvento(eventoId));
      this.mesas.set(lista);
    } finally {
      this.cargando.set(false);
    }
  }

  async crearMesa(datos: MesaFormulario): Promise<Mesa> {
    const creada = await firstValueFrom(this.client.crearMesa(datos));
    this.mesas.update((actuales) => [...actuales, creada]);
    return creada;
  }

  async actualizarMesa(id: string | number, cambios: Partial<Mesa>): Promise<Mesa> {
    const actualizada = await firstValueFrom(this.client.actualizarMesa(id, cambios));
    this.mesas.update((actuales) =>
      actuales.map((m) => (m.id === id ? actualizada : m))
    );
    return actualizada;
  }

  async eliminarMesa(id: string | number): Promise<void> {
    await firstValueFrom(this.client.eliminarMesa(id));
    this.mesas.update((actuales) => actuales.filter((m) => m.id !== id));
  }
}