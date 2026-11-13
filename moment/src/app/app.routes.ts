import { Routes } from '@angular/router';
import { LoginComponent } from './autenticacion/features/login/login'; // Asegúrate de que la ruta coincida con la ubicación de tu componente

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: '', redirectTo: 'login', pathMatch: 'full' } // Esto hace que al entrar a localhost:4200 te mande directo al login
];