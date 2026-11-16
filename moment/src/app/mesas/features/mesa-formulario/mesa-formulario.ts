import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MesaStore } from '../../data-access/mesa-store';
import { Mesa } from '../../data-access/mesa.model'; // Asegurate de tener la ruta correcta a tu interfaz


@Component({
  selector: 'app-mesa-formulario',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './mesa-formulario.html',
  styleUrl: './mesa-formulario.css'
})
export class MesaFormulario implements OnInit {
  private fb = inject(FormBuilder);
  protected mesaStore = inject(MesaStore);
  private route = inject(ActivatedRoute);

  modoVista = signal<'lista' | 'formulario'>('lista');
  editandoId = signal<number | string | null>(null);
  mesaForm: FormGroup;

  constructor() {
    this.mesaForm = this.fb.group({
      // Validación 1: Obligatorio, mínimo 1, máximo 150 mesas
      numero: ['', [Validators.required, Validators.min(1), Validators.max(150)]],
      // Validación lógica de salón: Obligatorio, min 1, máximo 12 personas por mesa
      capacidad: [4, [Validators.required, Validators.min(1), Validators.max(12)]],
      activa: [true, Validators.required]
    });
  }

  private obtenerEventoId(): string | number {
    const eventoId = this.route.snapshot.paramMap.get('eventoId') || 
                     this.route.snapshot.parent?.paramMap.get('eventoId');
    return eventoId ? eventoId : 1; 
  }

  ngOnInit(): void {
    const eventoId = this.obtenerEventoId();
    this.mesaStore.cargarMesasPorEvento(eventoId);
  }

  irNuevo(): void {
    this.editandoId.set(null);
    this.mesaForm.reset({ numero: '', capacidad: 4, activa: true });
    this.modoVista.set('formulario');
  }

  irEditar(mesa: any): void {
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

    // Validación de número duplicado en el mismo evento (exceptuando la mesa que estamos editando)
    const mesasActuales = this.mesaStore.mesas();
    const mesaDuplicada = mesasActuales.find(m => Number(m.numero) === numeroIngresado && m.id !== idActual);

    if (mesaDuplicada) {
      this.mesaForm.get('numero')?.setErrors({ duplicado: true });
      return;
    }

    const eventoId = this.obtenerEventoId();
    const formValues = {
      ...this.mesaForm.value,
      eventoId: eventoId 
    };

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

  // SCRUM-19: Descargar QR individual de una mesa como imagen PNG
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

  // SCRUM-19: Exportar / Imprimir todos los códigos QR activos
  exportarTodosQr(): void {
    const mesasConQr = this.mesaStore.mesas().filter(m => m.codigoQr);
    
    if (mesasConQr.length === 0) {
      alert('No hay mesas con códigos QR generados para exportar.');
      return;
    }

    // impresión nativa del navegador (permite imprimir en papel o guardar como PDF)
    window.print();
  }
}