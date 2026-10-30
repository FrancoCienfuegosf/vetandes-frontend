import { Routes } from '@angular/router';
import { permisoGuard } from '../../core/guards/permiso-guard';
import { MascotaForm } from './pages/mascota-form/mascota-form';
import { MascotaList } from './pages/mascota-list/mascota-list';

export const MASCOTAS_ROUTES: Routes = [
  { path: '', component: MascotaList, title: 'Mascotas',
    canActivate: [permisoGuard], data: { permiso: 'MASCOTA_LEER' } },
  { path: 'nuevo', component: MascotaForm, title: 'Nueva mascota',
    canActivate: [permisoGuard], data: { permiso: 'MASCOTA_ESCRIBIR' } },
  { path: ':id/editar', component: MascotaForm, title: 'Editar mascota',
    canActivate: [permisoGuard], data: { permiso: 'MASCOTA_ESCRIBIR' } },
];
