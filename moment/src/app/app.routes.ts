import { Routes } from '@angular/router';
import { ROUTE_SEGMENTS } from './app.route.segments';

export const routes: Routes = [
  { 
    path: '', 
    redirectTo: ROUTE_SEGMENTS.auth, 
    pathMatch: 'full' 
  },

  {
    path: ROUTE_SEGMENTS.auth,
    loadChildren: () => import('./autenticacion/ui/autenticacion.routes').then(m => m.default),
  },

  {
    path: ROUTE_SEGMENTS.eventos,
    loadChildren: () => import('./eventos/evento.routes').then(m => m.default),
  },
];