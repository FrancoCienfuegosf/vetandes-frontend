import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { AtencionesPorEspecie } from '../../../../core/models/reporte.model';
import { ReporteService } from '../../../../core/services/reporte-service';
import { mensajeError } from '../../../../core/utils/http-error';

/* Solo muestra lo que calcula el backend (GROUP BY); aqui no se agrega nada. */
@Component({
  selector: 'app-reporte-especie',
  imports: [ReactiveFormsModule, CurrencyPipe],
  templateUrl: './reporte-especie.html',
  styleUrl: './reporte-especie.css',
})
export class ReporteEspecie implements OnInit {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly reporteService = inject(ReporteService);

  protected readonly filas = signal<AtencionesPorEspecie[]>([]);
  protected readonly cargando = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly filtros = this.fb.group({ desde: [''], hasta: [''] });

  /** Ancho relativo de cada barra (100 % = la especie con mayor importe). */
  protected readonly maximo = computed(() => Math.max(0, ...this.filas().map((f) => f.importeTotal)));

  ngOnInit(): void {
    this.consultar();
  }

  consultar(): void {
    const { desde, hasta } = this.filtros.getRawValue();
    this.cargando.set(true);
    this.error.set(null);
    this.reporteService.atencionesPorEspecie(desde, hasta).subscribe({
      next: (datos) => {
        this.filas.set(datos);
        this.cargando.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.error.set(mensajeError(err));
        this.cargando.set(false);
      },
    });
  }

  protected porcentaje(importe: number): number {
    return this.maximo() ? (importe / this.maximo()) * 100 : 0;
  }
}
