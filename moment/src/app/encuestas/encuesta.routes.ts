import { Routes } from '@angular/router';

export const ENCUESTA_ROUTES: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'gestion' },
  {
    path: 'gestion',
    loadComponent: () =>
      import('./features/encuesta-formulario/encuesta-formulario').then((m) => m.EncuestaFormulario),
  },
];

export default ENCUESTA_ROUTES;