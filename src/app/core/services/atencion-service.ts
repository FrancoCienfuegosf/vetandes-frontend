import { inject, Service } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Atencion, AtencionRequest, FiltroAtencion } from '../models/atencion.model';

@Service()
export class AtencionService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/atenciones`;

  /** Los filtros viajan como parametros de URL; los vacios no se envian. */
  buscar(filtro: FiltroAtencion): Observable<Atencion[]> {
    let params = new HttpParams();
    for (const [clave, valor] of Object.entries(filtro)) {
      if (valor) {
        params = params.set(clave, valor);
      }
    }
    return this.http.get<Atencion[]>(this.url, { params });
  }

  obtener(id: number): Observable<Atencion> {
    return this.http.get<Atencion>(`${this.url}/${id}`);
  }

  registrar(dto: AtencionRequest): Observable<Atencion> {
    return this.http.post<Atencion>(this.url, dto);
  }

  anular(id: number, motivo: string): Observable<Atencion> {
    return this.http.patch<Atencion>(`${this.url}/${id}/anular`, { motivo });
  }
}
