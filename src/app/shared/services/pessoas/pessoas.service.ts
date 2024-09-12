import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import {
  IPerson,
  IPersonACApi,
  IPersonTableData,
} from '../../interfaces/person.interface';

import {
  IHttpGetRequestBody,
  IHttpGetResponseBody,
} from '../../interfaces/http/http-get.interface';
import { ISelectList } from '../../interfaces/select-list.interface';

import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class PessoasService {
  private _url = `${environment.apiUrl}/pessoas`;

  constructor(private _http: HttpClient) {}

  public getPessoaById(id: number): Observable<IPerson> {
    return this._http.get<IPerson>(`${this._url}/${id}`);
  }

  public getResponsavelByOrganizacaoId(orgId: number): Observable<ISelectList> {
    return this._http.get<ISelectList>(`${this._url}/responsavel/${orgId}`);
  }

  public getPessoasPaginated(
    pageConfig: IHttpGetRequestBody
  ): Observable<IHttpGetResponseBody<IPersonTableData>> {
    const params = {
      size: pageConfig.size?.toString() ?? '15',
      page: pageConfig.page !== undefined ? pageConfig.page.toString() : '0',
      sort: pageConfig.sort !== undefined ? pageConfig.sort?.toString() : '',
      search:
        pageConfig.search !== undefined ? pageConfig.search.toString() : '', // Ensure search is always a string
    };

    return this._http.get<IHttpGetResponseBody<IPersonTableData>>(
      `${this._url}?${new URLSearchParams(params).toString()}`
    );
  }

  public putPessoa(
    id: number,
    body: FormData,
    isBySubNovo: boolean
  ): Observable<IPerson> {
    let url = isBySubNovo
      ? `${this._url}/meu-perfil/${id}`
      : `${this._url}/${id}`;
    return this._http.put<IPerson>(url, body);
  }

  public deletePessoa(id: number): Observable<string> {
    return this._http.delete(`${this._url}/${id}`, { responseType: 'text' });
  }

  public postPessoa(body: FormData): Observable<IPerson> {
    return this._http.post<IPerson>(this._url, body);
  }

  public getMeuPerfil(subNovo: string): Observable<IPerson> {
    const params = {
      subNovo: subNovo,
    };

    return this._http.get<IPerson>(`${this._url}/meu-perfil`, {
      params: params,
    });
  }

  public searchACPessoaByCpf(cpf: string): Observable<IPersonACApi> {
    return this._http.get<IPersonACApi>(`${this._url}/acesso-cidadao/${cpf}`);
  }
}
