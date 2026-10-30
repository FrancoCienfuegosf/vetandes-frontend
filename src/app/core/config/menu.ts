import { Permiso } from '../auth/auth.model';

export interface MenuItem {
  etiqueta: string;
  ruta: string;
  icono: string;
  /** Permiso necesario para ver la opcion; sin permiso, la ve todo usuario. */
  permiso?: Permiso;
  /** routerLinkActive solo con la ruta exacta (para no marcar dos opciones). */
  exacto?: boolean;
}

export const MENU: MenuItem[] = [
  { etiqueta: 'Inicio', ruta: '/inicio', icono: '🏠' },
  { etiqueta: 'Prestaciones', ruta: '/prestaciones', icono: '💉', permiso: 'PRESTACION_LEER' },
  { etiqueta: 'Mascotas', ruta: '/mascotas', icono: '🐾', permiso: 'MASCOTA_LEER' },
  { etiqueta: 'Nueva atención', ruta: '/atenciones/nueva', icono: '➕', permiso: 'ATENCION_REGISTRAR' },
  { etiqueta: 'Atenciones', ruta: '/atenciones', icono: '📋', permiso: 'ATENCION_LEER', exacto: true },
  { etiqueta: 'Reporte por especie', ruta: '/reportes', icono: '📊', permiso: 'REPORTE_VER' },
];
