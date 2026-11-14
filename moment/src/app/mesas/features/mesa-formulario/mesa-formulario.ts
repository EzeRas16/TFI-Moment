import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MesaStore } from '../../data-access/mesa-store';

@Component({
  selector: 'app-mesa-formulario',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './mesa-formulario.html',
  styleUrl: './mesa-formulario.css'
})
export class MesaFormularioComponent {
  private fb = inject(FormBuilder);
  protected mesaStore = inject(MesaStore);

  // Signal para controlar si estamos viendo la lista o el formulario (alta/edición)
  modoVista = signal<'lista' | 'formulario'>('lista');
  
  // Signal para saber si estamos editando o creando uno nuevo
  editandoId = signal<number | string | null>(null);

  mesaForm: FormGroup;

  constructor() {
    this.mesaForm = this.fb.group({
      numero: ['', [Validators.required, Validators.min(1)]],
      activa: [true, Validators.required]
    });
  }

  // Abrir formulario para CREAR (Alta - SCRUM-15)
  irNuevo(): void {
    this.editandoId.set(null);
    this.mesaForm.reset({ numero: '', activa: true });
    this.modoVista.set('formulario');
  }

  // Abrir formulario para EDITAR (Modificación - SCRUM-17)
  irEditar(mesa: any): void {
    this.editandoId.set(mesa.id);
    this.mesaForm.setValue({
      numero: mesa.numero,
      activa: mesa.activa
    });
    this.modoVista.set('formulario');
  }

  // Volver al listado
  volverALista(): void {
    this.modoVista.set('lista');
  }

  // Guardar (Alta o Modificación)
  guardar(): void {
    if (this.mesaForm.invalid) {
      this.mesaForm.markAllAsTouched();
      return;
    }

    const formValues = this.mesaForm.value;
    const id = this.editandoId();

    if (id !== null) {
      
      // Lógica de Modificación (SCRUM-17)
      // this.mesaStore.actualizarMesa(id, formValues); 
    } else {
      
      // Lógica de Alta (SCRUM-15)
      this.mesaStore.crearMesa(formValues);
    }

    this.volverALista();
  }

  // Baja (SCRUM-16)
  eliminar(id: string | number): void {
    if (confirm('¿Estás seguro de eliminar esta mesa?')) {
      this.mesaStore.eliminarMesa(id);
    }
  }
}