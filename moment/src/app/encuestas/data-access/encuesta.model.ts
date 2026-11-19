export interface OpcionEncuesta {
  id: string;
  texto: string;
  votos: number;
}

export interface Encuesta {
  id?: string;
  eventoId: string | number;
  pregunta: string;
  opciones: OpcionEncuesta[];
  activa: boolean;
  creadaEn?: string;
}