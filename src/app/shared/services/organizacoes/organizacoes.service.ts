import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import {
  IOrganization,
  IOrganizationTableData,
} from '../../interfaces/organization.interface';
import {
  IHttpGetRequestBody,
  IHttpGetResponseBody,
} from '../../interfaces/http-get.interface';

import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class OrganizacoesService {
  private _url = `${environment.apiUrl}/organizacoes`;

  constructor(private _http: HttpClient) {}

  public getOrganizacaoById(id: number): Observable<IOrganization> {
    return this._http.get<IOrganization>(`${this._url}/${id}`);
  }

  public getOrganizacoesPaginated(
    pageConfig: IHttpGetRequestBody
  ): Observable<IHttpGetResponseBody<IOrganizationTableData>> {
    const params = {
      size: pageConfig.size?.toString() ?? '15',
      page: pageConfig.page !== undefined ? pageConfig.page.toString() : '0',
      sort: pageConfig.sort !== undefined ? pageConfig.sort?.toString() : '',
      search:
        pageConfig.search !== undefined ? pageConfig.search.toString() : '',
    };

    return this._http.get<IHttpGetResponseBody<IOrganizationTableData>>(
      `${this._url}?${new URLSearchParams(params).toString()}`
    );
  }

  public putOrganizacao(id: number, body: FormData): Observable<IOrganization> {
    return this._http.put<IOrganization>(`${this._url}/${id}`, body);
  }

  public deleteOrganizacao(id: number): Observable<string> {
    return this._http.delete(`${this._url}/${id}`, { responseType: 'text' });
  }

  public postOrganizacao(body: FormData): Observable<IOrganization> {
    return this._http.post<IOrganization>(this._url, body);
  }
}
