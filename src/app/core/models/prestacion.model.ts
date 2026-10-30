export type EspecieAplicable = 'PERRO' | 'GATO' | 'TODAS';

export interface Prestacion {
  id: number;
  codigo: string;
  nombre: string;
  precio: number;
  especieAplicable: EspecieAplicable;
  activo: boolean;
}

export interface PrestacionRequest {
  codigo: string;
  nombre: string;
  precio: number;
  especieAplicable: EspecieAplicable;
  activo?: boolean;
}
