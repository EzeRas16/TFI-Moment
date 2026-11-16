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

  protected readonly modo = signal<'login' | 'registro'>('login');

  nombre = '';
  email = '';
  password = '';

  // Signals para estados visuales
  errorMessage = signal('');
  isLoading = signal(false);
  showPassword = signal(false);

  public isLoggedIn = this.authState.isLoggedIn;

  toggleShowPassword() {
    this.showPassword.update(value => !value);
  }

  // Método para cambiar de pestaña y limpiar errores
  cambiarModo(nuevoModo: 'login' | 'registro') {
    this.modo.set(nuevoModo);
    this.errorMessage.set('');
    this.limpiarCampos();
  }

  limpiarCampos() {
    this.nombre = '';
    this.email = '';
    this.password = '';
  }

  onSubmit() {
    if (this.modo() === 'login') {
      this.ejecutarLogin();
    } else {
      this.ejecutarRegistro();
    }
  }

  private ejecutarLogin() {
    if (!this.email || !this.password) {
      this.errorMessage.set('Por favor, completa todos los campos.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    this.authService.login(this.email, this.password).subscribe({
      next: (usuario) => {
        this.isLoading.set(false);
        if (usuario) {
          this.authState.setSession(usuario);
          this.limpiarCampos();
          this.router.navigate(['/eventos']);
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

  private ejecutarRegistro() {
    if (!this.nombre || !this.email || !this.password) {
      this.errorMessage.set('Por favor, completa todos los campos para registrarte.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    const payload = {
      nombre: this.nombre,
      email: this.email,
      contrasena: this.password,
      rol: 'usuario' 
    };

    this.authService.registrar(payload).subscribe({
      next: (usuarioCreado) => {
        this.isLoading.set(false);
        this.authState.setSession(usuarioCreado);
        this.limpiarCampos();
        this.router.navigate(['/eventos']);
      },
      error: (err) => {
        this.isLoading.set(false);
        console.error('Error en registro:', err);
        this.errorMessage.set('No se pudo crear el usuario. Intente con otro correo.');
      }
    });
  }
}