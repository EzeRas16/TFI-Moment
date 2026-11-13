import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../data-access/auth.service';
import { AuthStateService } from '../../data-access/auth-state.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {
  private authService = inject(AuthService);
  private authState = inject(AuthStateService);

  email = signal('');
  password = signal('');
  errorMessage = signal('');
  isLoading = signal(false);

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
}