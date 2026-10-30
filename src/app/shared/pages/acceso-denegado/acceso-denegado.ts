import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

/* La sesion sigue activa: solo se informa que esta ruta no corresponde. */
@Component({
  selector: 'app-acceso-denegado',
  imports: [RouterLink],
  template: `
    <section class="card">
      <h2>🔒 Acceso denegado</h2>
      <p>Su usuario no tiene permiso para ver esta página.</p>
      <a routerLink="/inicio" class="btn btn-primary">Volver al inicio</a>
    </section>
  `,
})
export class AccesoDenegado {}
