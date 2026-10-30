import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/** Equivale a @PastOrPresent del backend: la fecha (yyyy-MM-dd) no puede ser futura. */
export function fechaNoFutura(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const valor = control.value as string | null;
    if (!valor) {
      return null;
    }
    return valor > hoyIso() ? { fechaFutura: true } : null;
  };
}

/** Fecha local de hoy como yyyy-MM-dd (sin el desfase de toISOString). */
export function hoyIso(): string {
  const d = new Date();
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mes}-${dia}`;
}
