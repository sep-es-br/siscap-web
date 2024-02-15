import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { IEntidade } from '../../interfaces/entidade.interface';

@Injectable({
  providedIn: 'root',
})
export class EntidadeService {
  private _url = `${environment.api}/entidade/select`;

  constructor(private _http: HttpClient) {}

  public getEntidades(): Observable<IEntidade[]> {
    return this._http.get<IEntidade[]>(this._url);
  }
}
