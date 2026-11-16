import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AutenticacionService } from '../../data-access/autenticacion.service';
import { AutenticacionStateService } from '../../data-access/autenticacion-state.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {
  private authService = inject(AutenticacionService);
  private authState = inject(AutenticacionStateService);
  private router = inject(Router);

  // Propiedades del formulario (ngModel funciona perfecto con strings normales)
  email = '';
  password = '';

  // Signals para los estados visuales
  errorMessage = signal('');
  isLoading = signal(false);
  showPassword = signal(false);

  public isLoggedIn = this.authState.isLoggedIn;

  toggleShowPassword() {
    this.showPassword.update(value => !value);
  }

  onLogin() {
    if (!this.email || !this.password) {
      this.errorMessage.set('Por favor, completa todos los campos.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    this.authService.login(this.email, this.password).subscribe({
      next: (usuario) => {
        this.isLoading.set(false);
        
        console.log('Objeto usuario recibido del servicio:', usuario);

        if (usuario) {
          console.log('¡Login exitoso! Bienvenido:', usuario.nombre || (usuario as any).name);
          
          // Guardamos la sesión en el servicio (que a su vez lo guarda en el localStorage)
          this.authState.setSession(usuario);

          // Limpiamos campos
          this.email = '';
          this.password = '';

          // 🚀 Redirigimos a la pantalla principal o de eventos de la app
          this.router.navigate(['/eventos']); // Ajusta la ruta según tu app

        } else {
          this.errorMessage.set('Correo o contraseña incorrectos.');
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        console.error('Error de conexión:', err);
        this.errorMessage.set('No se pudo conectar con el servidor.');
      }
    });
  }
}