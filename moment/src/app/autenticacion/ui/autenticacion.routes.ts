import { Routes } from '@angular/router';

const autenticacionRoutes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  {
    path: 'login',
    loadComponent: () =>
      import('../features/login/login').then((m) => m.LoginComponent), // Ajusta 'm.Login' o 'm.LoginComponent' según el nombre real de tu clase
  },
];

export default autenticacionRoutes;