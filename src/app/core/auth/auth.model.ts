/** Permisos de la matriz 3.2 (los mismos nombres que el backend). */
export type Permiso =
  | 'PRESTACION_LEER'
  | 'PRESTACION_ESCRIBIR'
  | 'MASCOTA_LEER'
  | 'MASCOTA_ESCRIBIR'
  | 'ATENCION_LEER'
  | 'ATENCION_REGISTRAR'
  | 'ATENCION_ANULAR'
  | 'REPORTE_VER';

export interface LoginRequest {
  username: string;
  password: string;
}

/** Respuesta de POST /auth/login */
export interface LoginResponse {
  token: string;
  tipo: string;
  expiraEnSegundos: number;
  username: string;
  nombreCompleto: string;
  roles: string[];
  permisos: Permiso[];
}

/** Lo que se guarda en sessionStorage. expiraEn es una fecha ISO. */
export interface Sesion {
  token: string;
  username: string;
  nombreCompleto: string;
  roles: string[];
  permisos: Permiso[];
  expiraEn: string;
}
