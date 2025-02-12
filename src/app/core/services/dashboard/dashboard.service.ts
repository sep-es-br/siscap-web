import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import { IDashboardDados } from '../../interfaces/dashboard.interface';

import { environment } from '../../../../environments/environment';

// 12/02/2025
// ALTERACOES PROVISORIAS APENAS PARA APRESENTACAO; A SEREM REMOVIDAS POSTERIORMENTE

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private readonly _url = `${environment.apiUrl}/dashboard`;

  constructor(private readonly _http: HttpClient) {}

  public buscarDadosDashboard(): Observable<IDashboardDados> {
    return this._http.get<IDashboardDados>(this._url);
  }
}
