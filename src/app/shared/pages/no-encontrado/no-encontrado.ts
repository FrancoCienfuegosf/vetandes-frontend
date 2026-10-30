import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-no-encontrado',
  imports: [RouterLink],
  template: `
    <section class="card" style="max-width: 560px; margin: 48px auto;">
      <h2>404 · Página no encontrada</h2>
      <p>La dirección no existe en VetAndes.</p>
      <a routerLink="/inicio" class="btn btn-primary">Volver al inicio</a>
    </section>
  `,
})
export class NoEncontrado {}
