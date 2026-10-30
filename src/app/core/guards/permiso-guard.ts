import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Permiso } from '../auth/auth.model';
import { AuthService } from '../auth/auth-service';

/*
 * Lee el permiso de data.permiso de la ruta. Si el usuario no lo tiene
 * (por ejemplo, escribe /atenciones/nueva a mano), muestra "Acceso
 * denegado" SIN cerrar la sesion. Es experiencia de usuario: la proteccion
 * real es el 403 del backend.
 */
export const permisoGuard: CanActivateFn = (route) => {
  const permiso = route.data['permiso'] as Permiso | undefined;
  if (!permiso || inject(AuthService).tienePermiso(permiso)) {
    return true;
  }
  return inject(Router).createUrlTree(['/acceso-denegado']);
};
