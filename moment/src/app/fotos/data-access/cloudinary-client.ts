import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { CLOUDINARY } from './cloudinary.config';

export interface RespuestaCloudinary {
  secure_url: string;
  public_id: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
}

export const FORMATOS_PERMITIDOS = ['image/jpeg', 'image/png'] as const; // solo png o jpg, no videos, no gifs, no pdfs, etc etc
export const TAMANIO_MAXIMO_MB = 10; // 10 mb de maximo, hay que probar si funciona con 20 mb o algo asi.

// Devuelve un mensaje de error, o null si el archivo es válido.
export function validarArchivo(archivo: File): string | null {
  if (!(FORMATOS_PERMITIDOS as readonly string[]).includes(archivo.type)) {
    return 'Formato no permitido. Usá JPG o PNG.';
  }
  if (archivo.size > TAMANIO_MAXIMO_MB * 1024 * 1024) {
    return `La imagen supera los ${TAMANIO_MAXIMO_MB} MB.`; // usamos la variable por si cambia su valor, es posible que pase
  }
  return null;
}

@Service()
export class CloudinaryClient {
  private http = inject(HttpClient);
  private url = `https://cloudinary.com{CLOUDINARY.cloudName}/image/upload`;

  subirImagen(archivo: File) { 
    const datos = new FormData(); // Crea un contenedor especial para empaquetar archivos binarios
    datos.append('file', archivo); // archivo bajo la clave 'file' que pide Cloudinary
    datos.append('upload_preset', CLOUDINARY.uploadPreset); // esto tambien sale de cloudinary, se creo en el user
    return this.http.post<RespuestaCloudinary>(this.url, datos); // Envía la petición POST y devuelve un Observable con la respuesta
  } // este codigo esta todo explicado con comentarios porque es una api nueva, que estamos aprendiendo a suar
}
