import { Invitado } from '../../invitados/data-access/invitado.model';
export type Id = number | string;

export interface Foto {
  id: Id;
  eventoId: Id;
  retoId: Id;
  invitadoId: Id;
  urlCloudinary: string;
  publicId: string;
  fechaSubida: string;
  estado: 'Visible' | 'Oculta';
}

export type FotoNueva = Omit<Foto, 'id'>;

export type FotoConAutor = Foto & { invitado?: Pick<Invitado, 'nombre' | 'apodo'> };