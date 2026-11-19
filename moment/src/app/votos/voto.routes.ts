import { Routes } from '@angular/router';

export const VOTO_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/voto-formulario/voto-encuesta').then((m) => m.VotarEncuesta),
  },
];

export default VOTO_ROUTES;