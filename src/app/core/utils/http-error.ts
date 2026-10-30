import { HttpErrorResponse } from '@angular/common/http';
import { ErrorResponse } from '../models/error-response';

/** Mensaje que devolvio el backend (400, 404, 409...) o uno de conexion. */
export function mensajeError(err: HttpErrorResponse): string {
  if (err.status === 0) {
    return 'No se pudo conectar con el servidor. Verifique que el backend esté en ejecución y que CORS permita este origen.';
  }
  const cuerpo = err.error as ErrorResponse | null;
  return cuerpo?.mensaje ?? `Error ${err.status}: ${err.statusText}`;
}

/** Errores por campo de un 400 ("campos"), para mostrarlos bajo cada control. */
export function erroresDeValidacion(err: HttpErrorResponse): Record<string, string> {
  const cuerpo = err.error as ErrorResponse | null;
  return cuerpo?.campos ?? {};
}
