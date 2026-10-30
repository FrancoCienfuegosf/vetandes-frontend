/** Formato comun de error del backend (seccion 3.5 del examen). */
export interface ErrorResponse {
  timestamp: string;
  status: number;
  error: string;
  mensaje: string;
  ruta: string;
  campos?: Record<string, string>;
}
