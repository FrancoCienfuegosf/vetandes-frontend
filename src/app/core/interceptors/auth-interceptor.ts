import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { AuthService } from '../auth/auth-service';

/*
 * PUNTO UNICO donde se agrega Authorization: Bearer <token>.
 * Solo a las peticiones dirigidas a NUESTRA API: el token nunca se envia a
 * otros dominios. Los servicios HTTP no saben nada del token.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const esNuestraApi = req.url.startsWith(environment.apiUrl);
  const token = esNuestraApi ? inject(AuthService).token() : null;
  if (!token) {
    return next(req);
  }
  return next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
};
