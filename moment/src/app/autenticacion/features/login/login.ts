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
  private servicioAutenticacion = inject(AutenticacionService);
  private estadoAutenticacion = inject(AutenticacionStateService);
  private router = inject(Router);

  protected readonly modo = signal<'iniciar' | 'registro'>('iniciar');

  nombre = '';
  email = '';
  contrasena = '';

  mensajeError = signal('');
  cargando = signal(false);
  mostrarContrasena = signal(false);

  public estaAutenticado = this.estadoAutenticacion.isLoggedIn;

  alternarMostrarContrasena() {
    this.mostrarContrasena.update(valor => !valor);
  }

  cambiarModo(nuevoModo: 'iniciar' | 'registro') {
    this.modo.set(nuevoModo);
    this.mensajeError.set('');
    this.limpiarCampos();
  }

  limpiarCampos() {
    this.nombre = '';
    this.email = '';
    this.contrasena = '';
  }

  alEnviar() {
    if (this.modo() === 'iniciar') {
      this.ejecutarInicioSesion();
    } else {
      this.ejecutarRegistro();
    }
  }

  private ejecutarInicioSesion() {
    if (!this.email || !this.contrasena) {
      this.mensajeError.set('Por favor, completa todos los campos.');
      return;
    }

    this.cargando.set(true);
    this.mensajeError.set('');

    this.servicioAutenticacion.iniciarSesion(this.email, this.contrasena).subscribe({
      next: (usuario) => {
        this.cargando.set(false);
        if (usuario) {
          this.estadoAutenticacion.establecerSesion(usuario);
          this.limpiarCampos();
          this.router.navigate(['/eventos']);
        } else {
          this.mensajeError.set('Correo o contraseña incorrectos.');
        }
      },
      error: (err) => {
        this.cargando.set(false);
        console.error('Error de conexión:', err);
        this.mensajeError.set('No se pudo conectar con el servidor.');
      }
    });
  }

  private ejecutarRegistro() {
    if (!this.nombre || !this.email || !this.contrasena) {
      this.mensajeError.set('Por favor, completa todos los campos para registrarte.');
      return;
    }

    this.cargando.set(true);
    this.mensajeError.set('');

    const datosRegistro = {
      nombre: this.nombre,
      email: this.email,
      contrasena: this.contrasena,
      rol: 'usuario' 
    };

    this.servicioAutenticacion.registrar(datosRegistro).subscribe({
      next: (usuarioCreado) => {
        this.cargando.set(false);
        this.estadoAutenticacion.establecerSesion(usuarioCreado);
        this.limpiarCampos();
        this.router.navigate(['/eventos']);
      },
      error: (err) => {
        this.cargando.set(false);
        console.error('Error en registro:', err);
        this.mensajeError.set('No se pudo crear el usuario. Intente con otro correo.');
      }
    });
  }
}