import { Routes } from '@angular/router';

export const MESA_ROUTES: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'gestion' },
  {
    path: 'gestion',
    loadComponent: () =>
      import('./features/mesa-lista/mesa-lista').then((m) => m.MesaLista),
  },
  {
    path: 'nueva',
    loadComponent: () =>
      import('./features/mesa-formulario/mesa-formulario').then((m) => m.MesaFormulario),
  },
  {
    path: 'editar/:id',
    loadComponent: () =>
      import('./features/mesa-formulario/mesa-formulario').then((m) => m.MesaFormulario),
  },
];

export default MESA_ROUTES;