export interface Evento {
    id : string | number;
    nombre : string;
    fecha : string; // Para el json la fecha la pasamos como string, pero en la base de datos sera un date
    usuarioId : string | number;
    tipo : string;
    estado : string;

}

export const ESTADOS = ['Pendiente', 'Finalizado', 'Cancelado'] as const; // por el momento solo hay 3 estados pero en un futuro se podrian agregar mas estados de eventos
export const TIPOS = ['Casamiento'] as const; // por el momento solo hay casamientos pero en un futuro se podrian agregar mas tipos de eventos

export type eventoFormulario = Omit<Evento, 'id' | 'usuarioId' | 'estado'>; 