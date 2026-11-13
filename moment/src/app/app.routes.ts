import { Routes } from '@angular/router';
import { ROUTE_SEGMENTS } from './app.route.segments';

export const routes: Routes = [
  
  {
    path: ROUTE_SEGMENTS.eventos,
    loadChildren: () => import('./eventos/evento.routes'),
  },

 
];
