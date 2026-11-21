import { Component, inject, input, output } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MesaStore } from '../../data-access/mesa-store';
import { Mesa } from '../../data-access/mesa.model';

@Component({
  selector: 'app-mesa-invitados-panel',
  standalone: true,
  imports: [],
  templateUrl: './mesa-invitados-panel.html',
  styleUrl: './mesa-invitados-panel.css',
})
export class MesaInvitadosPanel {
  private readonly mesaStore = inject(MesaStore);
  private readonly route = inject(ActivatedRoute);

  readonly mesa = input.required<Mesa>();
  readonly invitados = input<any[]>([]);
  readonly cerrar = output<void>();
  readonly invitadoExpulsado = output<void>();

  async expulsarInvitado(invitadoId: string | number): Promise<void> {
    if (!confirm('¿Estás seguro de que querés expulsar a este invitado de la mesa?')) return;

    const eventoId =
      this.route.snapshot.paramMap.get('eventoId') ||
      this.route.snapshot.parent?.paramMap.get('eventoId') ||
      1;

    await this.mesaStore.expulsarInvitadoDeMesa(invitadoId, eventoId);
    this.invitadoExpulsado.emit();
  }
}