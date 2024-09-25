import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { BehaviorSubject, Observable } from 'rxjs';

import { ProgramaFormModel } from '../../models/programa.model';

import { IHttpBase } from '../../interfaces/http/http-base.interface';
import {
  IHttpGetRequestBody,
  IHttpGetResponseBody,
} from '../../interfaces/http/http-get.interface';
import {
  IPrograma,
  IProgramaTableData,
} from '../../interfaces/programa.interface';

import { PageableQueryStringParametersHelper } from '../../helpers/pageable-query-string-parameters.helper';

import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ProgramasService
  implements IHttpBase<IPrograma, IProgramaTableData, ProgramaFormModel>
{
  private _url = `${environment.apiUrl}/programas`;

  private _idPrograma$: BehaviorSubject<number> = new BehaviorSubject<number>(
    0
  );

  public get idPrograma$(): BehaviorSubject<number> {
    return this._idPrograma$;
  }

  constructor(private _http: HttpClient) {}

  public getAllPaged(
    pageConfig: IHttpGetRequestBody
  ): Observable<IHttpGetResponseBody<IProgramaTableData>> {
    return this._http.get<IHttpGetResponseBody<IProgramaTableData>>(this._url, {
      params:
        PageableQueryStringParametersHelper.buildQueryStringParams(pageConfig),
    });
  }

  public getById(id: number): Observable<IPrograma> {
    return this._http.get<IPrograma>(`${this._url}/${id}`);
  }

  public post(body: ProgramaFormModel): Observable<IPrograma> {
    return this._http.post<IPrograma>(this._url, body);
  }

  public put(id: number, body: ProgramaFormModel): Observable<IPrograma> {
    return this._http.put<IPrograma>(`${this._url}/${id}`, body);
  }

  public delete(id: number): Observable<string> {
    return this._http.delete(`${this._url}/${id}`, { responseType: 'text' });
  }
}
