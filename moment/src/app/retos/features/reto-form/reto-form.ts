import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RetoService } from '../../data-access/reto.service';

@Component({
  selector: 'app-reto-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reto-form.html',
  styleUrl: './reto-form.css'
})
export class RetoForm {
  private retoService = inject(RetoService);

  descripcion = '';
  isLoading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');

  guardarReto() {
    if (!this.descripcion.trim()) {
      this.errorMessage.set('Por favor, ingresa una descripción para el reto.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.retoService.crearReto({ descripcion: this.descripcion }).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.successMessage.set('¡Reto guardado con éxito!');
        this.descripcion = ''; 
      },
      error: (err) => {
        this.isLoading.set(false);
        console.error('Error al crear el reto:', err);
        this.errorMessage.set('No se pudo guardar el reto. Verifica que el json-server esté corriendo.');
      }
    });
  }
}