import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { catchError, firstValueFrom, forkJoin, of } from 'rxjs';
import { EventoClient } from '../../../eventos/data-access/evento-client';
import { InvitadoClient } from '../../../invitados/data-access/invitado-client';
import { FotoClient } from '../../data-access/foto.client';
import { FotoConAutor } from '../../data-access/foto.model';

@Component({
  selector: 'app-foto-galeria',
  templateUrl: './foto-galeria.html',
  styleUrl: './foto-galeria.css',
})
export class FotoGaleria implements OnInit {
  private readonly fotoClient = inject(FotoClient);
  private readonly invitadoClient = inject(InvitadoClient);
  private readonly eventoClient = inject(EventoClient);
  private readonly ruta = inject(ActivatedRoute);

  protected readonly cargando = signal(true);
  protected readonly error = signal('');
  protected readonly fotos = signal<FotoConAutor[]>([]);
  protected readonly nombreEvento = signal('');

  async ngOnInit(): Promise<void> {
    const eventoId = this.ruta.snapshot.paramMap.get('eventoId');
    if (!eventoId) {
      this.error.set('No se indicó el evento.');
      this.cargando.set(false);
      return;
    }

    try {
      const [fotos, invitados, evento] = await firstValueFrom(
        forkJoin([
          this.fotoClient.obtenerFotosPorEvento(eventoId),
          this.invitadoClient.obtenerInvitados(),
          this.eventoClient.obtenerEventoPorId(eventoId).pipe(catchError(() => of(null))),
        ]),
      );

      this.nombreEvento.set(evento?.nombre ?? '');

      // Cada foto se asocia con el invitado que la subió, es enroscado pero los novios, tienen una mejor exp de usuario
      const invitadoPorId = new Map(invitados.map((i) => [String(i.id), i]));
      const fotosConAutor: FotoConAutor[] = fotos.map((foto) => ({
        ...foto,
        invitado:
          foto.invitadoId !== null ? invitadoPorId.get(String(foto.invitadoId)) : undefined,
      }));

      // Las más nuevas primero
      fotosConAutor.sort((a, b) => b.fechaSubida.localeCompare(a.fechaSubida));
      this.fotos.set(fotosConAutor);
    } catch {
      this.error.set('No se pudo cargar la galería. Intentá de nuevo.');
    } finally {
      this.cargando.set(false);
    }
  }

  protected autor(foto: FotoConAutor): string {
    return foto.invitado ? `${foto.invitado.nombre} "${foto.invitado.apodo}"` : 'Invitado';
  }

  // Pide a Cloudinary una versión chica; si no pueden pesar hasta 10 MB y es mucho.
  // Para esta primera versión será así; luego intentaremos optimizar la calidad.
  protected miniatura(url: string): string {
    return url.replace('/upload/', '/upload/c_fill,w_400,h_400,q_auto,f_auto/');
  }
}