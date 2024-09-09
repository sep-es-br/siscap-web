import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';

import { ProgramaFormModel } from '../../models/programa.model';

import {
  IPrograma,
  IProgramaTableData,
} from '../../interfaces/programa.interface';
import {
  IHttpGetRequestBody,
  IHttpGetResponseBody,
} from '../../interfaces/http-get.interface';

import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ProgramasService {
  private _url = `${environment.apiUrl}/programas`;

  constructor(private _http: HttpClient) {}

  public getProgramasPaged(
    pageConfig: IHttpGetRequestBody
  ): Observable<IHttpGetResponseBody<IProgramaTableData>> {
    const params = {
      size: pageConfig.size?.toString() ?? '15',
      page: pageConfig.page !== undefined ? pageConfig.page.toString() : '0',
      sort: pageConfig.sort !== undefined ? pageConfig.sort?.toString() : '',
      search:
        pageConfig.search !== undefined ? pageConfig.search.toString() : '',
    };

    return this._http.get<IHttpGetResponseBody<IProgramaTableData>>(this._url, {
      params: params,
    });
  }

  public getProgramaById(idPrograma: number): Observable<IPrograma> {
    return this._http.get<IPrograma>(`${this._url}/${idPrograma}`);
  }

  public postPrograma(body: ProgramaFormModel): Observable<IPrograma> {
    return this._http.post<IPrograma>(this._url, body);
  }

  public putPrograma(
    idPrograma: number,
    body: ProgramaFormModel
  ): Observable<IPrograma> {
    return this._http.put<IPrograma>(`${this._url}/${idPrograma}`, body);
  }

  public deletePrograma(idPrograma: number): Observable<string> {
    return this._http.delete(`${this._url}/${idPrograma}`, {
      responseType: 'text',
    });
  }
}
