import { Routes } from '@angular/router';
import { LoginComponent } from './autenticacion/features/login/login';
import { ROUTE_SEGMENTS } from './app.route.segments';       // <--- Viene de develop

export const routes: Routes = [
  // Ruta de inicio de sesión (Mati)
  { path: 'login', component: LoginComponent },
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  // Rutas de los submódulos existentes (Ezequiel / develop)
  {
    path: ROUTE_SEGMENTS.eventos,
    loadChildren: () => import('./eventos/evento.routes').then(m => m.default),
  },
];
