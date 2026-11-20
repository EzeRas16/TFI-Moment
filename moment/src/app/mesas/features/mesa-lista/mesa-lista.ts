import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { InvitadoClient } from '../../../invitados/data-access/invitado-client';
import { MesaClient } from '../../data-access/mesa-client';
import { MesaStore } from '../../data-access/mesa-store';
import { Mesa } from '../../data-access/mesa.model';
import { MesaInvitadosPanel } from '../mesa-invitados-panel/mesa-invitados-panel';

@Component({
  selector: 'app-mesa-lista',
  standalone: true,
  imports: [MesaInvitadosPanel],
  templateUrl: './mesa-lista.html',
  styleUrl: './mesa-lista.css',
})
export class MesaLista implements OnInit, OnDestroy {
  protected readonly mesaStore = inject(MesaStore);
  private readonly mesaClient = inject(MesaClient);
  private readonly invitadoClient = inject(InvitadoClient);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly eventoId = signal<string | number>(1);
  protected readonly invitadosPorMesa = signal<{ [mesaId: string]: any[] }>({});
  protected readonly mesaSeleccionada = signal<Mesa | null>(null);

  private pollingId: ReturnType<typeof setInterval> | null = null;

  ngOnInit(): void {
    const id =
      this.route.snapshot.paramMap.get('eventoId') ||
      this.route.snapshot.parent?.paramMap.get('eventoId') ||
      1;
    this.eventoId.set(id);

    this.mesaStore.cargarMesasPorEvento(id).then(() => {
      this.cargarInvitados();
    });

    this.pollingId = setInterval(() => {
      this.sincronizarEnTiempoReal(this.eventoId());
    }, 3000);
  }

  ngOnDestroy(): void {
    if (this.pollingId) {
      clearInterval(this.pollingId);
      this.pollingId = null;
    }
  }

  private async sincronizarEnTiempoReal(eventoId: string | number): Promise<void> {
    try {
      const mesasActualizadas = await firstValueFrom(this.mesaClient.getMesasPorEvento(eventoId));
      this.mesaStore.mesas.set(mesasActualizadas);

      const seleccionada = this.mesaSeleccionada();
      if (seleccionada) {
        const fresca = mesasActualizadas.find((m) => String(m.id) === String(seleccionada.id));
        if (fresca) {
          this.mesaSeleccionada.set(fresca);
        }
      }

      this.cargarInvitados();
    } catch {
      // Silencioso en ticks automáticos para no interrumpir la UI
    }
  }

  cargarInvitados(): void {
    this.invitadoClient.obtenerInvitados().subscribe({
      next: (invitados) => {
        const agrupados: { [key: string]: any[] } = {};
        const mesas = this.mesaStore.mesas();

        invitados.forEach((inv) => {
          const mesaEncontrada = mesas.find(
            (m) =>
              String(m.id) === String(inv.mesaId) ||
              (m.codigoQr && m.codigoQr.includes(String(inv.mesaId))),
          );

          if (mesaEncontrada) {
            const mesaIdStr = String(mesaEncontrada.id);
            if (!agrupados[mesaIdStr]) agrupados[mesaIdStr] = [];
            agrupados[mesaIdStr].push(inv);
          }
        });

        this.invitadosPorMesa.set(agrupados);
      },
      error: (err) => console.error('Error al cargar invitados para las mesas', err),
    });
  }

  irNuevaMesa(): void {
    this.router.navigate(['../nueva'], { relativeTo: this.route });
  }

  irEditarMesa(mesa: Mesa): void {
    this.router.navigate(['../editar', mesa.id], { relativeTo: this.route });
  }

  async eliminarMesa(id: string | number): Promise<void> {
    if (confirm('¿Estás seguro de eliminar esta mesa?')) {
      await this.mesaStore.eliminarMesa(id);
      if (String(this.mesaSeleccionada()?.id) === String(id)) {
        this.mesaSeleccionada.set(null);
      }
    }
  }

  verDetallesMesa(mesa: Mesa): void {
    this.mesaSeleccionada.set(mesa);
  }

  cerrarDetalles(): void {
    this.mesaSeleccionada.set(null);
  }

  async generarQr(mesa: Mesa): Promise<void> {
    await this.mesaStore.generarQrParaMesa(mesa);
  }

  async descargarQrIndividual(mesa: Mesa): Promise<void> {
    if (!mesa.codigoQr) return;

    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(mesa.codigoQr)}`;

    try {
      const response = await fetch(qrUrl);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `QR-Mesa-${mesa.numero}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error('Error al descargar el código QR', err);
      alert('No se pudo descargar el código QR.');
    }
  }

  exportarTodosQr(): void {
    const mesasConQr = this.mesaStore.mesas().filter((m) => m.codigoQr);

    if (mesasConQr.length === 0) {
      alert('No hay mesas con códigos QR generados para exportar.');
      return;
    }
    window.print();
  }
}