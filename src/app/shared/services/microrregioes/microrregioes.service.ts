import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { IMicrorregiao } from '../../interfaces/microrregiao.interface';

@Injectable({
  providedIn: 'root',
})
export class MicrorregioesService {
  private _url = `${environment.apiUrl}/microrregioes/select`;

  constructor(private _http: HttpClient) {}

  public getMicrorregioes(): Observable<IMicrorregiao[]> {
    return this._http.get<IMicrorregiao[]>(this._url);
  }
}
