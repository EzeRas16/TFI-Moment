export interface Foto {
  id: number;
  eventoId: number;
  retoId: number | null;
  invitadoId: number | null;
  urlCloudinary: string;
  publicId: string;
  fechaSubida: string;
  estado: 'Visible' | 'Oculta';
}

export type FotoNueva = Omit<Foto, 'id'>;