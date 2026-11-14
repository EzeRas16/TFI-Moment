import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AutenticacionStateService,  } from '../../data-access/autenticacion-state.service';
import { Router } from '@angular/router';
import { AutenticacionService } from '../../data-access/autenticacion.service';

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

  email = signal('');
  password = signal('');
  errorMessage = signal('');
  isLoading = signal(false);

  public isLoggedIn = this.authState.isLoggedIn;

  onLogin() {
    if (!this.email() || !this.password()) {
      this.errorMessage.set('Por favor, completa todos los campos.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    this.authService.login(this.email(), this.password()).subscribe({
      next: (usuario) => {
        this.isLoading.set(false);
        
        // Imprimimos el objeto completo para verificar qué propiedades trae exactamente
        console.log('Objeto usuario recibido del servicio:', usuario);

        if (usuario) {
          // Usamos 'usuario.nombre' (o 'usuario.name' por si en tu db.json está en inglés)
          console.log('¡Login exitoso! Bienvenido:', usuario.nombre || (usuario as any).name);
          
          // Guardamos la sesión en el estado global
          this.authState.setSession(usuario);

          // Limpiamos los campos del formulario
          this.email.set('');
          this.password.set('');

          // Aquí luego agregaremos la redirección a la pantalla principal
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
  cerrarSesion() {
    this.authState.logout();
    console.log('Sesión cerrada de forma exitosa');
  }
}