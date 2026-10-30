import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../auth/auth-service';

/*
 * Reacciona a los errores de seguridad del backend:
 *
 * - 401 (sin token, token alterado o vencido): la sesion ya no sirve, se
 *   cierra y se vuelve al login con returnUrl. Excepto el 401 del propio
 *   login, que solo significa "credenciales incorrectas".
 * - 403 (token valido, pero sin permiso): NO cierra la sesion. El error
 *   sigue hasta el componente, que muestra el mensaje del backend.
 */
export const sesionInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const esLogin = req.url === `${environment.apiUrl}/auth/login`;

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401 && !esLogin) {
        auth.cerrarSesion(router.url);
      }
      return throwError(() => err);
    }),
  );
};
