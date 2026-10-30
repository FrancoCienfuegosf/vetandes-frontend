import { Routes } from '@angular/router';
import { permisoGuard } from '../../core/guards/permiso-guard';
import { ReporteEspecie } from './pages/reporte-especie/reporte-especie';

export const REPORTES_ROUTES: Routes = [
  { path: '', component: ReporteEspecie, title: 'Reporte por especie',
    canActivate: [permisoGuard], data: { permiso: 'REPORTE_VER' } },
];
