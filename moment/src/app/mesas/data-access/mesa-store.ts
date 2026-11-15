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
    } catch (err) {
      console.error('Error al cargar mesas por evento', err);
      this.mesas.set([]); // En caso de error, dejamos la lista vacía para no romper la UI
    } finally {
      this.cargando.set(false); // <--- Garantiza que el spinner siempre se apague
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

 // SCRUM-18: Genera el enlace único y persiste el QR (con async/await)
  async generarQrParaMesa(mesa: Mesa): Promise<Mesa> {
    const tokenUnico = 'mesa-' + mesa.numero + '-' + Math.random().toString(36).substring(2, 9);
    const enlaceAcceso = `https://tuapp-evento.com/unirse?token=${tokenUnico}`;

    try {
      const mesaActualizada = await firstValueFrom(this.client.generarQrMesa(mesa.id, enlaceAcceso));
      
      // Actualizamos la mesa 
      this.mesas.update(mesas =>
        mesas.map(m => m.id === mesaActualizada.id ? mesaActualizada : m)
      );
      
      return mesaActualizada;
    } catch (err) {
      console.error('Error al generar el QR de la mesa', err);
      throw err;
    }
  }
}