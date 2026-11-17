import { Routes } from '@angular/router';

export default [
  {
    path: '',
    loadComponent: () => import('./features/reto-form/reto-form').then(m => m.RetoForm)
  }
] as Routes;
