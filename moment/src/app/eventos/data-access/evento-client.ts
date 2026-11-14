import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Evento, eventoFormulario , eventoNuevo } from './evento.model';

@Service()
export class EventoClient {
    private http = inject(HttpClient);
    private url = 'http://localhost:3000/eventos';


    obtenerEventos() {
        return this.http.get<Evento[]>(this.url);
    }

    crearEvento(evento : eventoNuevo) {
        return this.http.post<Evento>(this.url, evento);
    }

    borrarEvento(id : string | number) {
        return this.http.delete<Evento>(`${this.url}/${id}`);
    }

    obtenerEventoPorId(id : string | number) {
        return this.http.get<Evento>(`${this.url}/${id}`);
    }

    actualizarEvento(id : string | number, formularioEvento : eventoFormulario) {
        return this.http.patch<Evento>(`${this.url}/${id}`, formularioEvento);
    }
}
