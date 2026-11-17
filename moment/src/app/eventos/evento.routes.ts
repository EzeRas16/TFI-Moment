import { Routes } from '@angular/router';

const eventoRoutes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () =>
      import('./features/evento-lista/evento-lista').then((m) => m.EventoLista),
  },
  {
    path: 'nuevo',
    loadComponent: () =>
      import('./features/evento-formulario/evento-formulario').then((m) => m.EventoFormulario),
  },

  {
  path: ':id',
  loadComponent: () =>
    import('./features/evento-detalle/evento-detalle').then((m) => m.EventoDetalle),
},
];

export default eventoRoutes;