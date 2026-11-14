export interface Mesa {
  id: number;
  eventoId: number;
  numero: number;
  nombre?: string;
  codigoQr: string;
  activa: boolean;
}

export type MesaFormulario = Omit<Mesa, 'id' | 'codigoQr'>;

