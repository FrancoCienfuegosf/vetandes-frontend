import { Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/auth/auth-service';
import { MENU } from '../../core/config/menu';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  private readonly auth = inject(AuthService);

  /*
   * computed() depende del signal de permisos: si cambia el usuario, el
   * menu se recalcula solo, sin recargar la pagina.
   */
  protected readonly menu = computed(() => {
    const permisos = this.auth.permisos();
    return MENU.filter((item) => !item.permiso || permisos.includes(item.permiso));
  });
}
