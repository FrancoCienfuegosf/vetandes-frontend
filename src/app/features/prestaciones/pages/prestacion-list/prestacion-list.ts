import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { Prestacion } from '../../../../core/models/prestacion.model';
import { PrestacionService } from '../../../../core/services/prestacion-service';
import { mensajeError } from '../../../../core/utils/http-error';
import { SiPermiso } from '../../../../shared/directives/si-permiso';

@Component({
  selector: 'app-prestacion-list',
  imports: [RouterLink, CurrencyPipe, SiPermiso],
  templateUrl: './prestacion-list.html',
})
export class PrestacionList implements OnInit {
  private readonly prestacionService = inject(PrestacionService);

  protected readonly prestaciones = signal<Prestacion[]>([]);
  protected readonly cargando = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly mensaje = signal<string | null>(null);
  protected readonly busqueda = signal('');

  /** Buscador por codigo o nombre sobre la lista que llego del backend. */
  protected readonly filtradas = computed(() => {
    const texto = this.busqueda().trim().toLowerCase();
    return texto
      ? this.prestaciones().filter(
          (p) => p.codigo.toLowerCase().includes(texto) || p.nombre.toLowerCase().includes(texto),
        )
      : this.prestaciones();
  });

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.error.set(null);
    this.prestacionService.listar().subscribe({
      next: (datos) => {
        this.prestaciones.set(datos);
        this.cargando.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.error.set(mensajeError(err));
        this.cargando.set(false);
      },
    });
  }

  cambiarEstado(p: Prestacion): void {
    const accion = p.activo ? 'Dar de baja' : 'Reactivar';
    if (!confirm(`¿${accion} la prestación ${p.codigo} - ${p.nombre}?`)) {
      return;
    }
    this.limpiarMensajes();
    this.prestacionService.cambiarEstado(p.id, !p.activo).subscribe({
      next: (actualizada) => {
        this.prestaciones.update((lista) => lista.map((x) => (x.id === actualizada.id ? actualizada : x)));
        this.mensaje.set(`Prestación ${actualizada.codigo} ${actualizada.activo ? 'reactivada' : 'dada de baja'}.`);
      },
      error: (err: HttpErrorResponse) => this.error.set(mensajeError(err)),
    });
  }

  eliminar(p: Prestacion): void {
    if (!confirm(`¿Eliminar definitivamente la prestación ${p.codigo} - ${p.nombre}?`)) {
      return;
    }
    this.limpiarMensajes();
    this.prestacionService.eliminar(p.id).subscribe({
      next: () => {
        this.prestaciones.update((lista) => lista.filter((x) => x.id !== p.id));
        this.mensaje.set(`Prestación ${p.codigo} eliminada.`);
      },
      // 409 si ya se uso en atenciones: se muestra el mensaje y la lista sigue usable
      error: (err: HttpErrorResponse) => this.error.set(mensajeError(err)),
    });
  }

  private limpiarMensajes(): void {
    this.error.set(null);
    this.mensaje.set(null);
  }
}
