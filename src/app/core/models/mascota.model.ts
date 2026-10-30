export type Especie = 'PERRO' | 'GATO' | 'OTRO';
export type Sexo = 'M' | 'H';

export interface Mascota {
  id: number;
  nombre: string;
  especie: Especie;
  raza: string | null;
  fechaNacimiento: string; // yyyy-MM-dd
  sexo: Sexo;
  propietarioId: number;
  propietarioNombre: string;
}

export interface MascotaRequest {
  nombre: string;
  especie: Especie;
  raza: string | null;
  fechaNacimiento: string;
  sexo: Sexo;
  propietarioId: number;
}
