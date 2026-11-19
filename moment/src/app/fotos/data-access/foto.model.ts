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