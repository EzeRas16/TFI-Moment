   const FORMATO_FECHA = /^(\d{4})-(\d{2})-(\d{2})/; // 4 por año, 2 por mes, 2 por día. Ej: 2023-01-31

export interface ProblemaDeFecha {
  kind: string;
  message: string;
}

function convertirTextoEnFecha(texto: string): Date | null { 
  const partes = FORMATO_FECHA.exec(texto);
  if (!partes) return null;
  const [, anio, mes, dia] = partes;
  return new Date(Number(anio), Number(mes) - 1, Number(dia));
}

function obtenerHoySinHora(): Date {
  const ahora = new Date();
  return new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
}

function sumarUnAnio(fecha: Date): Date {
  return new Date(fecha.getFullYear() + 1, fecha.getMonth(), fecha.getDate());
}

export function convertirFechaEnTexto(fecha: Date): string {
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const dia = String(fecha.getDate()).padStart(2, '0');
  return `${fecha.getFullYear()}-${mes}-${dia}`;
}

export const FECHA_MINIMA_DEL_EVENTO = () => convertirFechaEnTexto(obtenerHoySinHora());
export const FECHA_MAXIMA_DEL_EVENTO = () => convertirFechaEnTexto(sumarUnAnio(obtenerHoySinHora())); // queremos que no puedan crear un evento para mas de un año de anticipación.

export function buscarProblemaDeFecha(
  textoFecha: string,
  fechaOriginalDelEvento?: string,
): ProblemaDeFecha | null {
  if (!textoFecha) return null; // lo vacío lo controla "required"

  const fecha = convertirTextoEnFecha(textoFecha);
  if (!fecha) return { kind: 'fechaInvalida', message: 'La fecha no es válida' };

  // Al editar sin tocar la fecha, no se vuelve a validar
  const cambioFecha =
    fechaOriginalDelEvento && textoFecha.slice(0, 10) === fechaOriginalDelEvento.slice(0, 10);
  if (!cambioFecha) return null;

  const hoy = obtenerHoySinHora();
  if (fecha < hoy) {
    return { kind: 'fechaPasada', message: 'La fecha no puede ser anterior a hoy' };
  }
  if (fecha > sumarUnAnio(hoy)) {
    return {
      kind: 'fechaMuyLejana',
      message: 'Solo se pueden crear eventos con hasta un año de anticipación',
    };
  }
  return null;
}