export interface Foto {
  id: number | string;
  eventoId: number | string | null;
  retoId: number | string | null;
  invitadoId: number | string | null;
  urlCloudinary: string;
  publicId: string;
  fechaSubida: string;
  estado: 'Visible' | 'Oculta';
}

export type FotoNueva = Omit<Foto, 'id'>;