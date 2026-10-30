import { Component, inject, OnInit, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { Mascota } from '../../../../core/models/mascota.model';
import { Propietario } from '../../../../core/models/propietario.model';
import { MascotaService } from '../../../../core/services/mascota-service';
import { PropietarioService } from '../../../../core/services/propietario-service';
import { mensajeError } from '../../../../core/utils/http-error';
import { SiPermiso } from '../../../../shared/directives/si-permiso';
import { EdadPipe } from '../../../../shared/pipes/edad-pipe';

@Component({
  selector: 'app-mascota-list',
  imports: [RouterLink, SiPermiso, EdadPipe],
  templateUrl: './mascota-list.html',
})
export class MascotaList implements OnInit {
  private readonly mascotaService = inject(MascotaService);
  private readonly propietarioService = inject(PropietarioService);

  protected readonly mascotas = signal<Mascota[]>([]);
  protected readonly propietarios = signal<Propietario[]>([]);
  protected readonly propietarioFiltro = signal<number | null>(null);
  protected readonly cargando = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly mensaje = signal<string | null>(null);

  ngOnInit(): void {
    this.propietarioService.listar().subscribe({
      next: (datos) => this.propietarios.set(datos),
      error: (err: HttpErrorResponse) => this.error.set(mensajeError(err)),
    });
    this.cargar();
  }

  /** El filtro por propietario lo resuelve el backend (?propietarioId=). */
  filtrarPorPropietario(valor: string): void {
    this.propietarioFiltro.set(valor ? Number(valor) : null);
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.error.set(null);
    this.mascotaService.listar(this.propietarioFiltro()).subscribe({
      next: (datos) => {
        this.mascotas.set(datos);
        this.cargando.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.error.set(mensajeError(err));
        this.cargando.set(false);
      },
    });
  }

  eliminar(m: Mascota): void {
    if (!confirm(`¿Eliminar a ${m.nombre} (propietario: ${m.propietarioNombre})?`)) {
      return;
    }
    this.error.set(null);
    this.mensaje.set(null);
    this.mascotaService.eliminar(m.id).subscribe({
      next: () => {
        this.mascotas.update((lista) => lista.filter((x) => x.id !== m.id));
        this.mensaje.set(`Mascota ${m.nombre} eliminada.`);
      },
      // 409 si tiene atenciones
      error: (err: HttpErrorResponse) => this.error.set(mensajeError(err)),
    });
  }
}
