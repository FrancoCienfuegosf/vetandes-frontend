import { Component, inject, input, OnInit, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { Especie, MascotaRequest, Sexo } from '../../../../core/models/mascota.model';
import { Propietario } from '../../../../core/models/propietario.model';
import { MascotaService } from '../../../../core/services/mascota-service';
import { PropietarioService } from '../../../../core/services/propietario-service';
import { erroresDeValidacion, mensajeError } from '../../../../core/utils/http-error';
import { fechaNoFutura, hoyIso } from '../../../../shared/validators/fecha-no-futura';

@Component({
  selector: 'app-mascota-form',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './mascota-form.html',
})
export class MascotaForm implements OnInit {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly mascotaService = inject(MascotaService);
  private readonly propietarioService = inject(PropietarioService);
  private readonly router = inject(Router);

  readonly id = input<string>();

  protected readonly hoy = hoyIso();
  protected readonly propietarios = signal<Propietario[]>([]);
  protected readonly cargando = signal(true);
  protected readonly guardando = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly erroresServidor = signal<Record<string, string>>({});

  // Validaciones equivalentes a MascotaRequestDTO del backend
  protected readonly form = this.fb.group({
    propietarioId: this.fb.control<number | null>(null, Validators.required),
    nombre: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(40)]],
    especie: this.fb.control<Especie | ''>('', Validators.required),
    raza: ['', Validators.maxLength(40)],
    fechaNacimiento: ['', [Validators.required, fechaNoFutura()]],
    sexo: this.fb.control<Sexo | ''>('', Validators.required),
  });

  protected esEdicion(): boolean {
    return !!this.id();
  }

  ngOnInit(): void {
    const id = this.id();
    if (id) {
      forkJoin({
        propietarios: this.propietarioService.listar(),
        mascota: this.mascotaService.obtener(Number(id)),
      }).subscribe({
        next: ({ propietarios, mascota }) => {
          this.propietarios.set(propietarios);
          this.form.setValue({
            propietarioId: mascota.propietarioId,
            nombre: mascota.nombre,
            especie: mascota.especie,
            raza: mascota.raza ?? '',
            fechaNacimiento: mascota.fechaNacimiento,
            sexo: mascota.sexo,
          });
          this.cargando.set(false);
        },
        error: (err: HttpErrorResponse) => this.fallarCarga(err),
      });
    } else {
      this.propietarioService.listar().subscribe({
        next: (propietarios) => {
          this.propietarios.set(propietarios);
          this.cargando.set(false);
        },
        error: (err: HttpErrorResponse) => this.fallarCarga(err),
      });
    }
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    const dto: MascotaRequest = {
      propietarioId: Number(v.propietarioId),
      nombre: v.nombre.trim(),
      especie: v.especie as Especie,
      raza: v.raza.trim() || null,
      fechaNacimiento: v.fechaNacimiento,
      sexo: v.sexo as Sexo,
    };
    const id = this.id();
    const peticion = id ? this.mascotaService.actualizar(Number(id), dto) : this.mascotaService.crear(dto);

    this.guardando.set(true);
    this.error.set(null);
    this.erroresServidor.set({});
    peticion.subscribe({
      next: () => this.router.navigate(['/mascotas']),
      error: (err: HttpErrorResponse) => {
        this.guardando.set(false);
        this.error.set(mensajeError(err)); // 409 nombre repetido / 404 propietario
        this.erroresServidor.set(erroresDeValidacion(err)); // 400 bajo cada campo
      },
    });
  }

  private fallarCarga(err: HttpErrorResponse): void {
    this.error.set(mensajeError(err));
    this.cargando.set(false);
  }
}
