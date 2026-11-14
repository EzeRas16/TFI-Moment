import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AutenticacionStateService } from '../../../autenticacion/data-access/autenticacion-state.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header {
  private authState = inject(AutenticacionStateService);
  private router = inject(Router);

  isDropdownOpen = false;

  // Señales del estado de sesión
  public isLoggedIn = this.authState.isLoggedIn;
  public currentUser = this.authState.currentUser;

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  onCerrarSesion() {
    this.isDropdownOpen = false;
    this.authState.logout();
    console.log('Sesión cerrada desde el header');
    this.router.navigate(['/login']);
  }
}