import { Pipe, PipeTransform } from '@angular/core';

/** "2020-03-15" -> "6 años" / "8 meses". */
@Pipe({ name: 'edad' })
export class EdadPipe implements PipeTransform {
  transform(fechaNacimiento: string | null | undefined): string {
    if (!fechaNacimiento) {
      return '';
    }
    const [anio, mes, dia] = fechaNacimiento.split('-').map(Number);
    const hoy = new Date();
    let meses = (hoy.getFullYear() - anio) * 12 + (hoy.getMonth() + 1 - mes);
    if (hoy.getDate() < dia) {
      meses--;
    }
    if (meses < 1) {
      return 'Menos de 1 mes';
    }
    if (meses < 12) {
      return `${meses} ${meses === 1 ? 'mes' : 'meses'}`;
    }
    const anios = Math.floor(meses / 12);
    return `${anios} ${anios === 1 ? 'año' : 'años'}`;
  }
}
