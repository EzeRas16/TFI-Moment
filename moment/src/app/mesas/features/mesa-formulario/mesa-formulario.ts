import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MesaStore } from '../../data-access/mesa-store';
import { Mesa } from '../../data-access/mesa.model';
import { InvitadoClient } from '../../../invitados/data-access/invitado-client';

@Component({
  selector: 'app-mesa-formulario',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './mesa-formulario.html',
  styleUrl: './mesa-formulario.css'
})
export class MesaFormulario implements OnInit {
  private readonly fb = inject(FormBuilder);
  protected readonly mesaStore = inject(MesaStore);
  private readonly route = inject(ActivatedRoute);
  private readonly invitadoClient = inject(InvitadoClient);

  modoVista = signal<'lista' | 'formulario'>('lista');
  editandoId = signal<number | string | null>(null);
  mesaForm: FormGroup;

  // SCRUM-23: Estado para control de invitados y panel de detalles por mesa
  invitadosPorMesa = signal<{ [mesaId: string | number]: any[] }>({});
  mesaSeleccionadaParaDetalle = signal<Mesa | null>(null);

  constructor() {
    this.mesaForm = this.fb.group({
      numero: ['', [Validators.required, Validators.min(1), Validators.max(150)]],
      capacidad: [4, [Validators.required, Validators.min(1), Validators.max(12)]],
      activa: [true, Validators.required]
    });
  }

  ngOnInit(): void {
    const eventoId = this.obtenerEventoId();
    this.mesaStore.cargarMesasPorEvento(eventoId).then(() => {
      // Cargamos los invitados una vez que las mesas están disponibles en el store
      this.cargarInvitados();
    });
  }

  private obtenerEventoId(): string | number {
    const eventoId = this.route.snapshot.paramMap.get('eventoId') || 
                     this.route.snapshot.parent?.paramMap.get('eventoId');
    return eventoId ? eventoId : 1; 
  }

  cargarInvitados(): void {
    this.invitadoClient.obtenerInvitados().subscribe({
      next: (invitados) => {
        const agrupados: { [key: string]: any[] } = {};
        const mesas = this.mesaStore.mesas();

        invitados.forEach(inv => {
          // Relacionamos el invitado con la mesa comparando el ID directo o buscando el token en el codigoQr
          const mesaEncontrada = mesas.find(m => 
            String(m.id) === String(inv.mesaId) || 
            (m.codigoQr && m.codigoQr.includes(String(inv.mesaId)))
          );

          if (mesaEncontrada) {
            const mesaIdStr = String(mesaEncontrada.id);
            if (!agrupados[mesaIdStr]) agrupados[mesaIdStr] = [];
            agrupados[mesaIdStr].push(inv);
          }
        });

        this.invitadosPorMesa.set(agrupados);
      },
      error: (err) => console.error('Error al cargar invitados para las mesas', err)
    });
  }

  irNuevo(): void {
    this.editandoId.set(null);
    this.mesaForm.reset({ numero: '', capacidad: 4, activa: true });
    this.modoVista.set('formulario');
  }

  irEditar(mesa: Mesa): void {
    this.editandoId.set(mesa.id);
    this.mesaForm.setValue({
      numero: mesa.numero,
      capacidad: mesa.capacidad || 4,
      activa: mesa.activa
    });
    this.modoVista.set('formulario');
  }

  volverALista(): void {
    this.modoVista.set('lista');
    this.mesaForm.reset({ numero: '', capacidad: 4, activa: true });
    this.editandoId.set(null);
  }

  guardar(): void {
    if (this.mesaForm.invalid) {
      this.mesaForm.markAllAsTouched();
      return;
    }

    const numeroIngresado = Number(this.mesaForm.get('numero')?.value);
    const idActual = this.editandoId();

    const mesasActuales = this.mesaStore.mesas();
    const mesaDuplicada = mesasActuales.find(m => Number(m.numero) === numeroIngresado && m.id !== idActual);

    if (mesaDuplicada) {
      this.mesaForm.get('numero')?.setErrors({ duplicado: true });
      return;
    }

    const eventoId = this.obtenerEventoId();
    const formValues = { ...this.mesaForm.value, eventoId };

    if (idActual !== null) {
      this.mesaStore.actualizarMesa(idActual, formValues); 
    } else {
      this.mesaStore.crearMesa(formValues);
    }

    this.volverALista();
  }

  eliminar(id: string | number): void {
    if (confirm('¿Estás seguro de eliminar esta mesa?')) {
      this.mesaStore.eliminarMesa(id);
    }
  }

  // --- ACCIONES SCRUM-23 (Detalles y Expulsión) ---

  verDetallesMesa(mesa: Mesa): void {
    this.mesaSeleccionadaParaDetalle.set(mesa);
  }

  cerrarDetalles(): void {
    this.mesaSeleccionadaParaDetalle.set(null);
  }

  expulsarInvitado(invitadoId: string | number): void {
    if (confirm('¿Estás seguro de que querés expulsar a este invitado de la mesa?')) {
      const eventoId = this.obtenerEventoId();
      this.mesaStore.expulsarInvitadoDeMesa(invitadoId, eventoId).then(() => {
        this.cargarInvitados(); // Actualizamos la lista local en tiempo real
      });
    }
  }

  // --- SCRUM-19: Utilidades de QR ---

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
    const mesasConQr = this.mesaStore.mesas().filter(m => m.codigoQr);
    
    if (mesasConQr.length === 0) {
      alert('No hay mesas con códigos QR generados para exportar.');
      return;
    }
    window.print();
  }
}