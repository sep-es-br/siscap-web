import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import { IDashboardProjeto } from '../../interfaces/dashboard.interface';

import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private _url = `${environment.apiUrl}/dashboard`;

  constructor(private _http: HttpClient) {}

  getQuantidadeProjetos(): Observable<IDashboardProjeto> {
    return this._http.get<IDashboardProjeto>(this._url);
  }
}
