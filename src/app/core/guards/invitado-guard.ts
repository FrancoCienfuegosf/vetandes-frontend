import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth/auth-service';

/* El login es solo para invitados: con sesion activa se va al inicio. */
export const invitadoGuard: CanActivateFn = () => {
  return inject(AuthService).token() ? inject(Router).createUrlTree(['/inicio']) : true;
};
