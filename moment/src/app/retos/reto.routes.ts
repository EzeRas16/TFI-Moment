import { Routes } from '@angular/router';

export default [
  {
    path: '',
    loadComponent: () => import('./features/reto-form/reto-form').then((m) => m.RetoForm),
  },
  {
    path: ':retoId',
    loadComponent: () => import('./features/reto-detalle/reto-detalle'),
  },
] as Routes;