import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { BehaviorSubject, Observable } from 'rxjs';

import { ProspeccaoFormModel } from '../../models/prospeccao.model';

import { IHttpBase } from '../../interfaces/http/http-base.interface';
import {
  IHttpGetRequestBody,
  IHttpGetResponseBody,
} from '../../interfaces/http/http-get.interface';
import {
  IProspeccao,
  IProspeccaoDetalhes,
  IProspeccaoTableData,
} from '../../interfaces/prospeccao.interface';

import { PageableQueryStringParametersHelper } from '../../helpers/pageable-query-string-parameters.helper';

import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ProspeccoesService
  implements IHttpBase<IProspeccao, IProspeccaoTableData, ProspeccaoFormModel>
{
  private readonly _url = `${environment.apiUrl}/prospeccoes`;

  private readonly _idProspeccao$: BehaviorSubject<number> =
    new BehaviorSubject<number>(0);

  public get idProspeccao$(): BehaviorSubject<number> {
    return this._idProspeccao$;
  }

  constructor(private readonly _http: HttpClient) {}

  public getAllPaged(
    pageConfig: IHttpGetRequestBody,
    ...searchFilter: { [key: string]: any }[]
  ): Observable<IHttpGetResponseBody<IProspeccaoTableData>> {
    return this._http.get<IHttpGetResponseBody<IProspeccaoTableData>>(
      this._url,
      {
        params: PageableQueryStringParametersHelper.buildQueryStringParams(
          pageConfig,
          ...searchFilter
        ),
      }
    );
  }

  public getById(id: number): Observable<IProspeccao> {
    return this._http.get<IProspeccao>(`${this._url}/${id}`);
  }

  public post(body: ProspeccaoFormModel): Observable<IProspeccao> {
    return this._http.post<IProspeccao>(this._url, body);
  }

  public put(id: number, body: ProspeccaoFormModel): Observable<IProspeccao> {
    return this._http.put<IProspeccao>(`${this._url}/${id}`, body);
  }

  public delete(id: number): Observable<string> {
    return this._http.delete(`${this._url}/${id}`, { responseType: 'text' });
  }

  public getProspeccaoDetalhes(id: number): Observable<IProspeccaoDetalhes> {
    return this._http.get<IProspeccaoDetalhes>(`${this._url}/${id}/detalhes`);
  }
}
