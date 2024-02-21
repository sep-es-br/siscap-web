import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { IEntidade } from '../../interfaces/entidade.interface';

@Injectable({
  providedIn: 'root',
})
export class EntidadesService {
  private _url = `${environment.api}/entidades/select`;

  constructor(private _http: HttpClient) {}

  public getEntidades(): Observable<IEntidade[]> {
    return this._http.get<IEntidade[]>(this._url);
  }
}
