import { Component, inject, OnInit, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Atencion } from '../../../../core/models/atencion.model';
import { AtencionService } from '../../../../core/services/atencion-service';
import { mensajeError } from '../../../../core/utils/http-error';
import { SiPermiso } from '../../../../shared/directives/si-permiso';

@Component({
  selector: 'app-atencion-list',
  imports: [RouterLink, ReactiveFormsModule, CurrencyPipe, DatePipe, SiPermiso],
  templateUrl: './atencion-list.html',
})
export class AtencionList implements OnInit {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly atencionService = inject(AtencionService);

  protected readonly atenciones = signal<Atencion[]>([]);
  protected readonly cargando = signal(false);
  protected readonly error = signal<string | null>(null);

  /* Filtros del contrato: mascota, especie, estado, desde y hasta */
  protected readonly filtros = this.fb.group({
    mascota: [''],
    especie: [''],
    estado: [''],
    desde: [''],
    hasta: [''],
  });

  ngOnInit(): void {
    this.buscar();
  }

  /** Los filtros viajan al backend como parametros; el backend filtra y ordena. */
  buscar(): void {
    this.cargando.set(true);
    this.error.set(null);
    this.atencionService.buscar(this.filtros.getRawValue()).subscribe({
      next: (datos) => {
        this.atenciones.set(datos);
        this.cargando.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.error.set(mensajeError(err));
        this.cargando.set(false);
      },
    });
  }

  limpiar(): void {
    this.filtros.reset();
    this.buscar();
  }
}
