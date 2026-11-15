export interface Mesa {
  id: number;
  eventoId: string | number;
  capacidad?: number;
  numero: number;
  nombre?: string;
  codigoQr?: string;
  activa: boolean;
}

export type MesaFormulario = Omit<Mesa, 'id' | 'codigoQr'>;

