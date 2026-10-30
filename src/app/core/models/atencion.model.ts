export type EstadoAtencion = 'REGISTRADA' | 'ANULADA';

export interface DetalleAtencion {
  id: number;
  prestacionId: number;
  prestacionCodigo: string;
  prestacionNombre: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface Atencion {
  id: number;
  numero: string;
  fecha: string;
  mascotaId: number;
  mascotaNombre: string;
  especie: string;
  propietarioId: number;
  propietarioNombre: string;
  peso: number;
  diagnostico: string | null;
  estado: EstadoAtencion;
  subtotal: number;
  descuento: number;
  total: number;
  usuarioRegistro: string;
  motivoAnulacion: string | null;
  detalles: DetalleAtencion[];
}

/** Lo que se envia: SIN precios ni totales (los calcula el backend). */
export interface AtencionRequest {
  mascotaId: number;
  peso: number;
  diagnostico: string | null;
  detalles: { prestacionId: number; cantidad: number }[];
}

export interface FiltroAtencion {
  mascota?: string;
  especie?: string;
  estado?: string;
  desde?: string;
  hasta?: string;
}
