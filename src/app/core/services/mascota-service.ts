import { inject, Service } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Mascota, MascotaRequest } from '../models/mascota.model';

@Service()
export class MascotaService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/mascotas`;

  listar(propietarioId?: number | null): Observable<Mascota[]> {
    const params = propietarioId ? new HttpParams().set('propietarioId', propietarioId) : undefined;
    return this.http.get<Mascota[]>(this.url, { params });
  }

  obtener(id: number): Observable<Mascota> {
    return this.http.get<Mascota>(`${this.url}/${id}`);
  }

  crear(dto: MascotaRequest): Observable<Mascota> {
    return this.http.post<Mascota>(this.url, dto);
  }

  actualizar(id: number, dto: MascotaRequest): Observable<Mascota> {
    return this.http.put<Mascota>(`${this.url}/${id}`, dto);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
