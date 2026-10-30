import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth-service';
import { SiPermiso } from '../../shared/directives/si-permiso';

@Component({
  selector: 'app-inicio',
  imports: [RouterLink, SiPermiso],
  template: `
    <section class="card">
      <h2>Bienvenido(a), {{ auth.nombreCompleto() }}</h2>
      <p>Seleccione un módulo en el menú lateral para comenzar.</p>
      <div class="acciones">
        <a *siPermiso="'ATENCION_REGISTRAR'" routerLink="/atenciones/nueva" class="btn btn-primary">+ Nueva atención</a>
        <a *siPermiso="'ATENCION_LEER'" routerLink="/atenciones" class="btn">Consultar atenciones</a>
        <a *siPermiso="'REPORTE_VER'" routerLink="/reportes" class="btn">Ver reporte</a>
      </div>
    </section>
  `,
})
export class Inicio {
  protected readonly auth = inject(AuthService);
}
