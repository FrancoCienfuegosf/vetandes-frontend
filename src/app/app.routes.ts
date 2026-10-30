import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';
import { invitadoGuard } from './core/guards/invitado-guard';
import { MainLayout } from './layout/main-layout/main-layout';

export const routes: Routes = [
  // Login FUERA del layout y solo para invitados
  {
    path: 'login',
    title: 'Iniciar sesión',
    canActivate: [invitadoGuard],
    loadComponent: () => import('./features/auth/login/login').then((m) => m.Login),
  },
  {
    path: '',
    component: MainLayout,
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'inicio' },
      {
        path: 'inicio',
        title: 'Inicio',
        loadComponent: () => import('./features/inicio/inicio').then((m) => m.Inicio),
      },
      {
        path: 'prestaciones',
        loadChildren: () => import('./features/prestaciones/prestaciones.routes').then((m) => m.PRESTACIONES_ROUTES),
      },
      {
        path: 'mascotas',
        loadChildren: () => import('./features/mascotas/mascotas.routes').then((m) => m.MASCOTAS_ROUTES),
      },
      {
        path: 'atenciones',
        loadChildren: () => import('./features/atenciones/atenciones.routes').then((m) => m.ATENCIONES_ROUTES),
      },
      {
        path: 'reportes',
        loadChildren: () => import('./features/reportes/reportes.routes').then((m) => m.REPORTES_ROUTES),
      },
      {
        path: 'acceso-denegado',
        title: 'Acceso denegado',
        loadComponent: () =>
          import('./shared/pages/acceso-denegado/acceso-denegado').then((m) => m.AccesoDenegado),
      },
    ],
  },
  {
    path: '**',
    title: 'Página no encontrada',
    loadComponent: () => import('./shared/pages/no-encontrado/no-encontrado').then((m) => m.NoEncontrado),
  },
];
