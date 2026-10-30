import { Component, inject, input, OnInit, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { EspecieAplicable, PrestacionRequest } from '../../../../core/models/prestacion.model';
import { PrestacionService } from '../../../../core/services/prestacion-service';
import { erroresDeValidacion, mensajeError } from '../../../../core/utils/http-error';

/*
 * Formulario UNICO para registrar (/prestaciones/nuevo) y editar
 * (/prestaciones/:id/editar). El :id llega como input gracias a
 * withComponentInputBinding().
 */
@Component({
  selector: 'app-prestacion-form',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './prestacion-form.html',
})
export class PrestacionForm implements OnInit {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly prestacionService = inject(PrestacionService);
  private readonly router = inject(Router);

  readonly id = input<string>();

  protected readonly cargando = signal(false);
  protected readonly guardando = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly erroresServidor = signal<Record<string, string>>({});

  // Mismas reglas que el backend (PrestacionRequestDTO)
  protected readonly form = this.fb.group({
    codigo: ['', [Validators.required, Validators.pattern(/^PRS-\d{3}$/)]],
    nombre: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(80)]],
    precio: this.fb.control<number | null>(null, [Validators.required, Validators.min(0.01)]),
    especieAplicable: this.fb.control<EspecieAplicable | ''>('', Validators.required),
    activo: [true],
  });

  protected esEdicion(): boolean {
    return !!this.id();
  }

  ngOnInit(): void {
    const id = this.id();
    if (!id) {
      return;
    }
    this.cargando.set(true);
    this.prestacionService.obtener(Number(id)).subscribe({
      next: (p) => {
        this.form.setValue({
          codigo: p.codigo,
          nombre: p.nombre,
          precio: p.precio,
          especieAplicable: p.especieAplicable,
          activo: p.activo,
        });
        this.cargando.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.error.set(mensajeError(err));
        this.cargando.set(false);
      },
    });
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    const dto: PrestacionRequest = {
      codigo: v.codigo.trim().toUpperCase(),
      nombre: v.nombre.trim(),
      precio: Number(v.precio),
      especieAplicable: v.especieAplicable as EspecieAplicable,
      activo: v.activo,
    };
    const id = this.id();
    const peticion = id ? this.prestacionService.actualizar(Number(id), dto) : this.prestacionService.crear(dto);

    this.guardando.set(true);
    this.error.set(null);
    this.erroresServidor.set({});
    peticion.subscribe({
      next: () => this.router.navigate(['/prestaciones']),
      error: (err: HttpErrorResponse) => {
        this.guardando.set(false);
        this.error.set(mensajeError(err)); // 409: "Ya existe una prestación con el código..."
        this.erroresServidor.set(erroresDeValidacion(err)); // 400: un mensaje por campo
      },
    });
  }
}
