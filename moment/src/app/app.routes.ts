import { Routes } from '@angular/router';
import { LoginComponent } from './autenticacion/features/login/login';

import { ROUTE_SEGMENTS } from './app.route.segments';

export const routes: Routes = [
  // Ruta de inicio de sesión
  { path: 'login', component: LoginComponent },
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  // Submódulo de eventos
  {
    path: ROUTE_SEGMENTS.eventos,
    loadChildren: () => import('./eventos/evento.routes').then(m => m.EVENTO_ROUTES),
  },

  // Submódulo de mesas (Integrado con el estándar del equipo)
  {
    path: ROUTE_SEGMENTS.mesas,
    loadChildren: () => import('./mesas/mesa.routes').then(m => m.MESA_ROUTES),
  },
];

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

