import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CurrencyPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import {
  AbstractControl,
  FormArray,
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AtencionRequest } from '../../../../core/models/atencion.model';
import { Mascota } from '../../../../core/models/mascota.model';
import { Prestacion } from '../../../../core/models/prestacion.model';
import { AtencionService } from '../../../../core/services/atencion-service';
import { MascotaService } from '../../../../core/services/mascota-service';
import { PrestacionService } from '../../../../core/services/prestacion-service';
import { erroresDeValidacion, mensajeError } from '../../../../core/utils/http-error';

type LineaForm = FormGroup<{
  prestacionId: FormControl<number | null>;
  cantidad: FormControl<number>;
}>;

const MAX_LINEAS = 8;
const PRESTACIONES_PARA_DESCUENTO = 3;
const PORCENTAJE_DESCUENTO = 0.1;

/** RN-03 en la SPA: la misma prestacion no puede repetirse en dos lineas. */
function sinRepetidas(control: AbstractControl): ValidationErrors | null {
  const ids = (control.value as { prestacionId: number | null }[])
    .map((l) => l.prestacionId)
    .filter((id): id is number => id !== null);
  return new Set(ids).size !== ids.length ? { repetida: true } : null;
}

/*
 * Registro cabecera-detalle.
 *
 * Los importes que se ven aqui son SOLO una vista previa para la
 * recepcionista. El request no lleva precios ni totales: el backend toma
 * el precio de la base de datos y calcula subtotal, descuento y total.
 */
@Component({
  selector: 'app-atencion-form',
  imports: [ReactiveFormsModule, RouterLink, CurrencyPipe],
  templateUrl: './atencion-form.html',
  styleUrl: './atencion-form.css',
})
export class AtencionForm implements OnInit {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly mascotaService = inject(MascotaService);
  private readonly prestacionService = inject(PrestacionService);
  private readonly atencionService = inject(AtencionService);

  protected readonly maxLineas = MAX_LINEAS;

  // ---- Buscador de mascota (por nombre o propietario) ----
  protected readonly mascotas = signal<Mascota[]>([]);
  protected readonly busqueda = signal('');
  protected readonly mascota = signal<Mascota | null>(null);
  protected readonly resultados = computed(() => {
    const texto = this.busqueda().trim().toLowerCase();
    if (!texto || this.mascota()) {
      return [];
    }
    return this.mascotas()
      .filter((m) => m.nombre.toLowerCase().includes(texto) || m.propietarioNombre.toLowerCase().includes(texto))
      .slice(0, 8);
  });

  // ---- Prestaciones activas que aplican a la especie de la mascota ----
  protected readonly prestaciones = signal<Prestacion[]>([]);
  protected readonly cargandoPrestaciones = signal(false);

  protected readonly enviando = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly erroresServidor = signal<Record<string, string>>({});
  protected readonly exito = signal<string | null>(null);

  protected readonly form = this.fb.group({
    peso: this.fb.control<number | null>(null, [Validators.required, Validators.min(0.01), Validators.max(999.99)]),
    diagnostico: ['', Validators.maxLength(300)],
    detalles: this.fb.array<LineaForm>([], [Validators.required, Validators.maxLength(MAX_LINEAS), sinRepetidas]),
  });

  get detalles(): FormArray<LineaForm> {
    return this.form.controls.detalles;
  }

  /** Valor del formulario como signal: cada cambio recalcula los importes al instante. */
  private readonly valor = toSignal(this.form.valueChanges, { initialValue: this.form.getRawValue() });

  /** Lineas con su precio y subtotal (vista previa). Se trabaja en centimos para no acumular decimales. */
  protected readonly lineas = computed(() => {
    const precios = new Map(this.prestaciones().map((p) => [p.id, p.precio]));
    return (this.valor().detalles ?? []).map((l) => {
      const precio = l?.prestacionId ? (precios.get(l.prestacionId) ?? 0) : 0;
      const cantidad = Number(l?.cantidad) || 0;
      return { precio, subtotal: (Math.round(precio * 100) * cantidad) / 100 };
    });
  });

  protected readonly distintas = computed(
    () => new Set((this.valor().detalles ?? []).map((l) => l?.prestacionId).filter((id) => !!id)).size,
  );
  protected readonly subtotal = computed(() => this.lineas().reduce((suma, l) => suma + Math.round(l.subtotal * 100), 0) / 100);
  protected readonly descuento = computed(() =>
    this.distintas() >= PRESTACIONES_PARA_DESCUENTO ? Math.round(this.subtotal() * 100 * PORCENTAJE_DESCUENTO) / 100 : 0,
  );
  protected readonly total = computed(() => Math.round((this.subtotal() - this.descuento()) * 100) / 100);

  ngOnInit(): void {
    this.mascotaService.listar().subscribe({
      next: (datos) => this.mascotas.set(datos),
      error: (err: HttpErrorResponse) => this.error.set(mensajeError(err)),
    });
  }

  seleccionarMascota(m: Mascota): void {
    this.mascota.set(m);
    this.busqueda.set('');
    this.detalles.clear(); // otra especie: las lineas anteriores podrian no aplicar
    this.cargarPrestaciones(m.especie);
    this.agregarLinea();
  }

  cambiarMascota(): void {
    this.mascota.set(null);
    this.prestaciones.set([]);
    this.detalles.clear();
  }

  agregarLinea(): void {
    if (this.detalles.length >= MAX_LINEAS) {
      return;
    }
    this.detalles.push(
      this.fb.group({
        prestacionId: this.fb.control<number | null>(null, Validators.required),
        cantidad: this.fb.control(1, [Validators.required, Validators.min(1), Validators.max(3)]),
      }),
    );
  }

  quitarLinea(indice: number): void {
    this.detalles.removeAt(indice);
  }

  /** Opciones de una linea: las prestaciones que NO estan elegidas en otra linea. */
  protected opcionesPara(indice: number): Prestacion[] {
    const elegidas = new Set(
      (this.valor().detalles ?? []).filter((_, i) => i !== indice).map((l) => l?.prestacionId),
    );
    return this.prestaciones().filter((p) => !elegidas.has(p.id));
  }

  registrar(): void {
    if (!this.mascota() || this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    const dto: AtencionRequest = {
      mascotaId: this.mascota()!.id,
      peso: Number(v.peso),
      diagnostico: v.diagnostico.trim() || null,
      detalles: v.detalles.map((l) => ({ prestacionId: Number(l.prestacionId), cantidad: Number(l.cantidad) })),
    };

    this.enviando.set(true); // deshabilita el boton: evita registrar dos veces
    this.error.set(null);
    this.erroresServidor.set({});
    this.exito.set(null);
    this.atencionService.registrar(dto).subscribe({
      next: (a) => {
        this.enviando.set(false);
        this.exito.set(`Atención ${a.numero} registrada. Total: S/ ${a.total.toFixed(2)}`);
        this.form.reset();
        this.cambiarMascota();
      },
      error: (err: HttpErrorResponse) => {
        // 409/400/404: se muestra el mensaje del backend y las lineas se conservan
        this.enviando.set(false);
        this.error.set(mensajeError(err));
        this.erroresServidor.set(erroresDeValidacion(err));
      },
    });
  }

  protected camposServidor(): [string, string][] {
    return Object.entries(this.erroresServidor());
  }

  private cargarPrestaciones(especie: string): void {
    this.cargandoPrestaciones.set(true);
    // El backend devuelve las de esa especie y las de TODAS; solo activas
    this.prestacionService.listar({ especie, activo: true }).subscribe({
      next: (datos) => {
        this.prestaciones.set(datos);
        this.cargandoPrestaciones.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.error.set(mensajeError(err));
        this.cargandoPrestaciones.set(false);
      },
    });
  }
}
