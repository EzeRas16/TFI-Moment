import { Routes } from '@angular/router';


export const MESA_ROUTES: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'gestion' },
  
  {
    path: 'gestion',
    loadComponent: () =>
      import('./features/mesa-formulario/mesa-formulario').then((m) => m.MesaFormularioComponent),
  },
];

export default MESA_ROUTES;