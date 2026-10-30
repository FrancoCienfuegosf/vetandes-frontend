import { Component, inject, input, OnInit, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Atencion } from '../../../../core/models/atencion.model';
import { AtencionService } from '../../../../core/services/atencion-service';
import { mensajeError } from '../../../../core/utils/http-error';
import { SiPermiso } from '../../../../shared/directives/si-permiso';

@Component({
  selector: 'app-atencion-detalle',
  imports: [RouterLink, ReactiveFormsModule, CurrencyPipe, DatePipe, SiPermiso],
  templateUrl: './atencion-detalle.html',
  styleUrl: './atencion-detalle.css',
})
export class AtencionDetalle implements OnInit {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly atencionService = inject(AtencionService);

  readonly id = input.required<string>();

  protected readonly atencion = signal<Atencion | null>(null);
  protected readonly cargando = signal(true);
  protected readonly anulando = signal(false);
  protected readonly mostrarAnular = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly mensaje = signal<string | null>(null);

  // RN-05: motivo obligatorio de 10 a 200 caracteres (igual que el backend)
  protected readonly motivo = this.fb.control('', [
    Validators.required,
    Validators.minLength(10),
    Validators.maxLength(200),
  ]);

  ngOnInit(): void {
    this.atencionService.obtener(Number(this.id())).subscribe({
      next: (a) => {
        this.atencion.set(a);
        this.cargando.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.error.set(mensajeError(err));
        this.cargando.set(false);
      },
    });
  }

  anular(): void {
    const actual = this.atencion();
    if (!actual) {
      return;
    }
    if (this.motivo.invalid) {
      this.motivo.markAsTouched();
      return;
    }
    if (!confirm(`¿Anular la atención ${actual.numero}?`)) {
      return;
    }
    this.anulando.set(true);
    this.error.set(null);
    this.atencionService.anular(actual.id, this.motivo.value.trim()).subscribe({
      next: (a) => {
        this.atencion.set(a);
        this.anulando.set(false);
        this.mostrarAnular.set(false);
        this.mensaje.set(`La atención ${a.numero} fue anulada.`);
      },
      error: (err: HttpErrorResponse) => {
        // 409: ya anulada o fuera de las 48 h; 403: sin permiso (no cierra la sesion)
        this.error.set(mensajeError(err));
        this.anulando.set(false);
      },
    });
  }
}
