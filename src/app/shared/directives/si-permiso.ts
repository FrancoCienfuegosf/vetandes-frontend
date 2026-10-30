import { Directive, effect, inject, input, TemplateRef, ViewContainerRef } from '@angular/core';
import { Permiso } from '../../core/auth/auth.model';
import { AuthService } from '../../core/auth/auth-service';

/*
 * Muestra el elemento solo si el usuario tiene el permiso:
 *   <button *siPermiso="'ATENCION_ANULAR'">Anular</button>
 *
 * Usa effect(): al cambiar los permisos de la sesion (otro usuario) el
 * boton aparece o desaparece solo. Ocultar es experiencia de usuario; el
 * backend igual responde 403 si se intenta la operacion.
 */
@Directive({ selector: '[siPermiso]' })
export class SiPermiso {
  private readonly auth = inject(AuthService);
  private readonly plantilla = inject(TemplateRef<unknown>);
  private readonly contenedor = inject(ViewContainerRef);

  readonly siPermiso = input.required<Permiso>();

  private visible = false;

  constructor() {
    effect(() => {
      const permitido = this.auth.permisos().includes(this.siPermiso());
      if (permitido && !this.visible) {
        this.contenedor.createEmbeddedView(this.plantilla);
        this.visible = true;
      } else if (!permitido && this.visible) {
        this.contenedor.clear();
        this.visible = false;
      }
    });
  }
}
