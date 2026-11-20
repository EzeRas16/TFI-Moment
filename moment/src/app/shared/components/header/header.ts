import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AutenticacionStateService } from '../../../autenticacion/data-access/autenticacion-state.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule,RouterLink,RouterLinkActive],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header {
  private estadoAutenticacion = inject(AutenticacionStateService);
  private router = inject(Router);

  menuDesplegableAbierto = false;

  public estaAutenticado = this.estadoAutenticacion.isLoggedIn;
  public usuarioActual = this.estadoAutenticacion.currentUser;

  alternarDesplegable() {
    this.menuDesplegableAbierto = !this.menuDesplegableAbierto;
  }

  alCerrarSesion() {
    this.menuDesplegableAbierto = false;
    this.estadoAutenticacion.cerrarSesion();
    console.log('Sesión cerrada desde el header');
  }
}