import { Injectable } from '@angular/core';

import { environment } from '../../../../environments/environment';
import { BehaviorSubject, Observable } from 'rxjs';
import { IHttpBase } from '../../interfaces/http/http-base.interface';
import {
  ICartaConsulta,
  ICartaConsultaDetalhes,
  ICartaConsultaTableData,
} from '../../interfaces/carta-consulta.interface';
import { CartaConsultaFormModel } from '../../models/carta-consulta.model';
import {
  IHttpGetRequestBody,
  IHttpGetResponseBody,
} from '../../interfaces/http/http-get.interface';
import { HttpClient } from '@angular/common/http';
import { PageableQueryStringParametersHelper } from '../../helpers/pageable-query-string-parameters.helper';

@Injectable({
  providedIn: 'root',
})
export class CartasConsultaService
  implements
    IHttpBase<ICartaConsulta, ICartaConsultaTableData, CartaConsultaFormModel>
{
  private _url = `${environment.apiUrl}/cartas-consulta`;

  private _idCartaConsulta$: BehaviorSubject<number> =
    new BehaviorSubject<number>(0);

  public get idCartaConsulta$(): BehaviorSubject<number> {
    return this._idCartaConsulta$;
  }

  constructor(private _http: HttpClient) {}

  public getAllPaged(
    pageConfig: IHttpGetRequestBody,
    ...searchFilter: { [key: string]: any }[]
  ): Observable<IHttpGetResponseBody<ICartaConsultaTableData>> {
    return this._http.get<IHttpGetResponseBody<ICartaConsultaTableData>>(
      this._url,
      {
        params: PageableQueryStringParametersHelper.buildQueryStringParams(
          pageConfig,
          ...searchFilter
        ),
      }
    );
  }

  public getById(id: number): Observable<ICartaConsulta> {
    return this._http.get<ICartaConsulta>(`${this._url}/${id}`);
  }

  public post(body: CartaConsultaFormModel): Observable<ICartaConsulta> {
    return this._http.post<ICartaConsulta>(this._url, body);
  }

  public put(
    id: number,
    body: CartaConsultaFormModel
  ): Observable<ICartaConsulta> {
    return this._http.put<ICartaConsulta>(`${this._url}/${id}`, body);
  }

  public delete(id: number): Observable<string> {
    return this._http.delete(`${this._url}/${id}`, { responseType: 'text' });
  }

  public getCartaConsultaDetalhes(
    id: number
  ): Observable<ICartaConsultaDetalhes> {
    return this._http.get<ICartaConsultaDetalhes>(
      `${this._url}/${id}/detalhes`
    );
  }
}
