import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RetoService } from '../../data-access/reto.service';
import { Reto } from '../../data-access/reto.model';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-reto-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reto-form.html',
  styleUrl: './reto-form.css'
})
export class RetoForm implements OnInit {
  private retoService = inject(RetoService);

  descripcion = '';
  isLoading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');

  retos = signal<Reto[]>([]);
  seleccionados = signal<Set<number | string>>(new Set());
  isLoadingList = signal(false);
  isDeleting = signal(false);
  isDropdownOpen = signal(false); 

  ngOnInit() {
    this.cargarRetos();
  }

  cargarRetos() {
    this.isLoadingList.set(true);
    this.retoService.obtenerRetos().subscribe({
      next: (data) => {
        this.retos.set(data);
        this.isLoadingList.set(false);
      },
      error: () => this.isLoadingList.set(false)
    });
  }

  toggleDropdown() {
    this.isDropdownOpen.update(val => !val);
  }

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
        this.cargarRetos(); 
      },
      error: (err) => {
        this.isLoading.set(false);
        console.error('Error al crear el reto:', err);
        this.errorMessage.set('No se pudo guardar el reto.');
      }
    });
  }

  toggleSeleccion(id: number | string) {
    const current = new Set(this.seleccionados());
    if (current.has(id)) {
      current.delete(id);
    } else {
      current.add(id);
    }
    this.seleccionados.set(current);
  }

  confirmarEliminacion() {
    if (this.seleccionados().size === 0) return;

    if (confirm(`¿Estás seguro de eliminar los ${this.seleccionados().size} retos seleccionados?`)) {
      this.isDeleting.set(true);
      
      const peticiones = Array.from(this.seleccionados()).map(id => this.retoService.eliminarReto(id));

      forkJoin(peticiones).subscribe({
        next: () => {
          this.isDeleting.set(false);
          this.seleccionados.set(new Set());
          this.cargarRetos(); 
        },
        error: (err) => {
          this.isDeleting.set(false);
          console.error('Error al eliminar retos:', err);
        }
      });
    }
  }
}