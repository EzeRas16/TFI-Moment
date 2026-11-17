import { Routes } from '@angular/router';
import { InvitadoFormulario } from './features/invitado-formulario/invitado-formulario';

export const invitado_Routes: Routes = [
  {
    path: 'registro/:token',
    component: InvitadoFormulario
  },
  {
    path: 'registro',
    component: InvitadoFormulario
  }
];