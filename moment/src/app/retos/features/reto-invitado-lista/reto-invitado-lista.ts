import { Component, Input, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { RetoService } from '../../data-access/reto.service';
import { Reto } from '../../data-access/reto.model';

@Component({
  selector: 'app-reto-invitado-lista',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reto-invitado-lista.html',
  styleUrl: './reto-invitado-lista.css'
})
export class RetoInvitadoLista implements OnInit {
  private readonly servicioReto = inject(RetoService);
  private readonly rutaActiva = inject(ActivatedRoute);
  private readonly router = inject(Router);

  @Input() eventoId: string | number | null = null;

  readonly retos = signal<Reto[]>([]);
  readonly eventoIdActual = signal<string | number | null>(null);
  readonly cargandoLista = signal(false);
  readonly desplegableListaAbierto = signal(true);

  readonly retosVisibles = computed(() => {
    const lista = this.retos();
    const idEvento = this.eventoIdActual();

    if (idEvento === null || idEvento === undefined || idEvento === '') {
      return lista;
    }

    return lista.filter((reto) => String(reto.eventoId) === String(idEvento));
  });

  ngOnInit(): void {
    const idDesdeRuta = this.rutaActiva.snapshot.paramMap.get('eventoId');
    const idFinal = this.eventoId ?? idDesdeRuta;
    if (idFinal !== null && idFinal !== undefined && idFinal !== '') {
      this.eventoIdActual.set(idFinal);
    }
    this.cargarRetos();
  }

  cargarRetos(): void {
    this.cargandoLista.set(true);
    this.servicioReto.obtenerRetos().subscribe({
      next: (data) => {
        this.retos.set(data);
        this.cargandoLista.set(false);
      },
      error: () => this.cargandoLista.set(false)
    });
  }

  alternarDesplegableLista(): void {
    this.desplegableListaAbierto.update((valor) => !valor);
  }

  irADetalleReto(reto: Reto): void {
    if (reto.id === undefined || reto.id === null) return;

    const idEvento = this.eventoIdActual() ?? reto.eventoId;
    if (idEvento !== undefined && idEvento !== null) {
      this.router.navigate(['/eventos', idEvento, 'retos', reto.id]);
    } else {
      this.router.navigate(['/retos', reto.id]);
    }
  }
}