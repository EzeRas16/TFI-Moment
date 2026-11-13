import { Routes } from '@angular/router';

const eventoRoutes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'nuevo' },
  // hay una sola ruta por ahora pq solo existe el form de eventos.
  {
    path: 'nuevo',
    loadComponent: () =>
      import('./features/evento-formulario/evento-formulario').then((m) => m.EventoFormulario),
  },
];

export default eventoRoutes;
