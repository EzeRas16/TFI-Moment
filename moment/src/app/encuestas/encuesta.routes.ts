import { Routes } from '@angular/router';

export const ENCUESTA_ROUTES: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'gestion' },
  {
    path: 'gestion',
    loadComponent: () =>
      import('./features/encuesta-formulario/encuesta-formulario').then((m) => m.EncuestaFormulario),
  },

  {
    path: 'resultados',
    loadComponent: () =>
      import('./features/encuesta-resultados/encuesta-resultados').then((m) => m.EncuestaResultados),
  },
];

export default ENCUESTA_ROUTES;