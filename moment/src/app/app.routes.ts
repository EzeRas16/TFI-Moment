import { Routes } from '@angular/router';
import { ROUTE_SEGMENTS } from './app.route.segments';

export const routes: Routes = [
  {
    path: '',
    redirectTo: ROUTE_SEGMENTS.auth,
    pathMatch: 'full',
  },

  {
    path: ROUTE_SEGMENTS.auth,
    loadChildren: () => import('./autenticacion/ui/autenticacion.routes').then((m) => m.default),
  },

  {
    path: ROUTE_SEGMENTS.eventos,
    loadChildren: () => import('./eventos/evento.routes').then((m) => m.default),
  },

  {
    path: ROUTE_SEGMENTS.eventos + '/:eventoId/' + ROUTE_SEGMENTS.mesas,
    loadChildren: () => import('./mesas/mesa.routes').then((m) => m.MESA_ROUTES),
  },

  {
    path: ROUTE_SEGMENTS.invitados,
    loadChildren: () => import('./invitados/invitado.routes').then(m => m.invitado_Routes)
  },

  {
    path: ROUTE_SEGMENTS.unirse,
    loadComponent: () => import('./invitados/features/invitado-formulario/invitado-formulario').then((m) => m.InvitadoFormulario)
  },

  {
    path: ROUTE_SEGMENTS.retos,
    loadChildren: () => import('./retos/reto.routes').then((m) => m.default),
  }
];