import { inject, Service } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Prestacion, PrestacionRequest } from '../models/prestacion.model';

/* Sin token aqui: lo agrega authInterceptor a todas las peticiones de la API. */
@Service()
export class PrestacionService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/prestaciones`;

  /** especie: devuelve las de esa especie y las de TODAS. activo: solo activas/inactivas. */
  listar(filtro: { especie?: string; activo?: boolean } = {}): Observable<Prestacion[]> {
    let params = new HttpParams();
    if (filtro.especie) {
      params = params.set('especie', filtro.especie);
    }
    if (filtro.activo !== undefined) {
      params = params.set('activo', filtro.activo);
    }
    return this.http.get<Prestacion[]>(this.url, { params });
  }

  obtener(id: number): Observable<Prestacion> {
    return this.http.get<Prestacion>(`${this.url}/${id}`);
  }

  crear(dto: PrestacionRequest): Observable<Prestacion> {
    return this.http.post<Prestacion>(this.url, dto);
  }

  actualizar(id: number, dto: PrestacionRequest): Observable<Prestacion> {
    return this.http.put<Prestacion>(`${this.url}/${id}`, dto);
  }

  /** Eliminacion fisica: el backend responde 409 si ya se uso en atenciones. */
  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }

  /** Baja (activo = false) o reactivacion (activo = true). */
  cambiarEstado(id: number, activo: boolean): Observable<Prestacion> {
    return this.http.patch<Prestacion>(`${this.url}/${id}/estado`, { activo });
  }
}
