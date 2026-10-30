import { Routes } from '@angular/router';
import { permisoGuard } from '../../core/guards/permiso-guard';
import { AtencionDetalle } from './pages/atencion-detalle/atencion-detalle';
import { AtencionForm } from './pages/atencion-form/atencion-form';
import { AtencionList } from './pages/atencion-list/atencion-list';

export const ATENCIONES_ROUTES: Routes = [
  { path: '', component: AtencionList, title: 'Atenciones',
    canActivate: [permisoGuard], data: { permiso: 'ATENCION_LEER' } },
  // 'nueva' va antes que ':id' para que no se lea como un id
  { path: 'nueva', component: AtencionForm, title: 'Nueva atención',
    canActivate: [permisoGuard], data: { permiso: 'ATENCION_REGISTRAR' } },
  { path: ':id', component: AtencionDetalle, title: 'Detalle de atención',
    canActivate: [permisoGuard], data: { permiso: 'ATENCION_LEER' } },
];
