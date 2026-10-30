import { Routes } from '@angular/router';
import { permisoGuard } from '../../core/guards/permiso-guard';
import { PrestacionForm } from './pages/prestacion-form/prestacion-form';
import { PrestacionList } from './pages/prestacion-list/prestacion-list';

export const PRESTACIONES_ROUTES: Routes = [
  { path: '', component: PrestacionList, title: 'Prestaciones',
    canActivate: [permisoGuard], data: { permiso: 'PRESTACION_LEER' } },
  { path: 'nuevo', component: PrestacionForm, title: 'Nueva prestación',
    canActivate: [permisoGuard], data: { permiso: 'PRESTACION_ESCRIBIR' } },
  { path: ':id/editar', component: PrestacionForm, title: 'Editar prestación',
    canActivate: [permisoGuard], data: { permiso: 'PRESTACION_ESCRIBIR' } },
];
