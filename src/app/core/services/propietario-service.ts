import { inject, Service } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Propietario } from '../models/propietario.model';

@Service()
export class PropietarioService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/propietarios`;

  listar(): Observable<Propietario[]> {
    return this.http.get<Propietario[]>(this.url);
  }
}
