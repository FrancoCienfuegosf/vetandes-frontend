import { inject, Service } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AtencionesPorEspecie } from '../models/reporte.model';

@Service()
export class ReporteService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/reportes`;

  atencionesPorEspecie(desde?: string, hasta?: string): Observable<AtencionesPorEspecie[]> {
    let params = new HttpParams();
    if (desde) {
      params = params.set('desde', desde);
    }
    if (hasta) {
      params = params.set('hasta', hasta);
    }
    return this.http.get<AtencionesPorEspecie[]>(`${this.url}/atenciones-por-especie`, { params });
  }
}
