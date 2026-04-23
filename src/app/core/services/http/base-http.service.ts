import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import {
  GetAllPaged,
  IHttpGetRequestBody,
  IHttpGetResponseBody,
} from '../../interfaces/http-get-all-paged.interface';
import { GetById } from '../../interfaces/http-get-by-id.interface';
import { DeleteById } from '../../interfaces/http-delete-by-id.interface';

import { PageableQueryStringParametersHelper } from '../../helpers/pageable-query-string-parameters.helper';

import { environment } from '../../../../environments/environment';

export abstract class BaseHttpService<T, TTableData>
  implements GetAllPaged<TTableData>, GetById<T>, DeleteById
{
  private readonly _httpClientRef: HttpClient;
  private readonly _targetUrl: string;

  constructor(httpClientRef: HttpClient, targetUrl: string) {
    this._httpClientRef = httpClientRef;
    this._targetUrl = `${environment.apiUrl}/${targetUrl}`;
  }

  public getAllPaged(
    pageConfig: IHttpGetRequestBody,
    ...searchFilter: { [key: string]: any }[]
  ): Observable<IHttpGetResponseBody<TTableData>> {
    return this._httpClientRef.get<IHttpGetResponseBody<TTableData>>(
      this._targetUrl,
      {
        params: PageableQueryStringParametersHelper.buildQueryStringParams(
          pageConfig,
          ...searchFilter
        ),
      }
    );
  }

  public getById(id: number): Observable<T> {
    return this._httpClientRef.get<T>(`${this._targetUrl}/${id}`);
  }

  public getBySub(sub: string): Observable<number> {
    return this._httpClientRef.post<number>(`${this._targetUrl}/syncPorSub/${sub}`,null);
  }

  public deleteById(id: number): Observable<string> {
    return this._httpClientRef.delete(`${this._targetUrl}/${id}`, {
      responseType: 'text',
    });
  }

  public deleteByIdJustificativa(id: number, justificativa: string): Observable<string> {
    return this._httpClientRef.delete(`${this._targetUrl}/${id}`, {
      body: { justificativa },
      responseType: 'text',
    });
  }

}
