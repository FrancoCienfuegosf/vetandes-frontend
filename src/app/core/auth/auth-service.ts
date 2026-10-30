import { computed, inject, Service, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginRequest, LoginResponse, Permiso, Sesion } from './auth.model';

const CLAVE_SESION = 'vetandes.sesion';

/*
 * Estado de la sesion en UN solo lugar.
 *
 * - La sesion vive en un signal: el menu, el header y los botones leen
 *   permisos() y se actualizan solos cuando cambia el usuario, sin recargar.
 * - Se guarda en sessionStorage (no localStorage): se borra al cerrar la
 *   pestana, importante en la computadora compartida de recepcion.
 * - Se guarda con su vencimiento (expiraEn). Al recargar (F5) se descarta si
 *   ya vencio, y mientras la app esta abierta un temporizador cierra la
 *   sesion en el instante exacto del vencimiento.
 */
@Service()
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private temporizador: ReturnType<typeof setTimeout> | null = null;

  private readonly _sesion = signal<Sesion | null>(this.leerSesionGuardada());

  readonly sesion = this._sesion.asReadonly();
  readonly autenticado = computed(() => this._sesion() !== null);
  readonly permisos = computed<Permiso[]>(() => this._sesion()?.permisos ?? []);
  readonly nombreCompleto = computed(() => this._sesion()?.nombreCompleto ?? '');
  readonly roles = computed(() => this._sesion()?.roles ?? []);

  constructor() {
    const sesion = this._sesion();
    if (sesion) {
      this.programarCierre(sesion.expiraEn);
    }
  }

  login(credenciales: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${environment.apiUrl}/auth/login`, credenciales).pipe(
      tap((r) => {
        const sesion: Sesion = {
          token: r.token,
          username: r.username,
          nombreCompleto: r.nombreCompleto,
          roles: r.roles,
          permisos: r.permisos,
          expiraEn: new Date(Date.now() + r.expiraEnSegundos * 1000).toISOString(),
        };
        sessionStorage.setItem(CLAVE_SESION, JSON.stringify(sesion));
        this._sesion.set(sesion);
        this.programarCierre(sesion.expiraEn);
      }),
    );
  }

  /** Token vigente o null si no hay sesion o ya vencio. */
  token(): string | null {
    const sesion = this._sesion();
    if (!sesion) {
      return null;
    }
    if (this.vencida(sesion)) {
      this.limpiar(); // el guard o el interceptor deciden a donde ir
      return null;
    }
    return sesion.token;
  }

  tienePermiso(permiso: Permiso): boolean {
    return this.permisos().includes(permiso);
  }

  /** Borra la sesion. Si se indica returnUrl, vuelve al login recordando la ruta. */
  cerrarSesion(returnUrl?: string): void {
    this.limpiar();
    this.router.navigate(['/login'], returnUrl ? { queryParams: { returnUrl } } : {});
  }

  private limpiar(): void {
    if (this.temporizador) {
      clearTimeout(this.temporizador);
      this.temporizador = null;
    }
    sessionStorage.removeItem(CLAVE_SESION);
    this._sesion.set(null);
  }

  private programarCierre(expiraEn: string): void {
    if (this.temporizador) {
      clearTimeout(this.temporizador);
    }
    const restante = new Date(expiraEn).getTime() - Date.now();
    // setTimeout admite como maximo ~24,8 dias; el token dura 1 hora.
    this.temporizador = setTimeout(() => this.cerrarSesion(this.router.url), Math.max(restante, 0));
  }

  private leerSesionGuardada(): Sesion | null {
    try {
      const texto = sessionStorage.getItem(CLAVE_SESION);
      if (!texto) {
        return null;
      }
      const sesion = JSON.parse(texto) as Sesion;
      if (!sesion.token || this.vencida(sesion)) {
        sessionStorage.removeItem(CLAVE_SESION);
        return null;
      }
      return sesion;
    } catch {
      sessionStorage.removeItem(CLAVE_SESION);
      return null;
    }
  }

  private vencida(sesion: Sesion): boolean {
    const expira = new Date(sesion.expiraEn).getTime();
    return Number.isNaN(expira) || expira <= Date.now();
  }
}
