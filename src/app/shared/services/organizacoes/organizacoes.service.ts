import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

import { Observable, catchError, throwError } from 'rxjs';

import { environment } from '../../../../environments/environment';
import {
  IOrganization,
  IOrganizationTableData,
} from '../../interfaces/organization.interface';
import { ErrorHandlerService } from '../error-handler/error-handler.service';
import {
  IHttpGetRequestBody,
  IHttpGetResponseBody,
} from '../../interfaces/http-get.interface';

@Injectable({
  providedIn: 'root',
})
export class OrganizacoesService {
  private _url = `${environment.apiUrl}/organizacoes`;

  constructor(
    private _http: HttpClient,
    private _errorHandlerService: ErrorHandlerService
  ) {}

  public getOrganizacaoById(id: number): Observable<IOrganization> {
    return this._http.get<IOrganization>(`${this._url}/${id}`).pipe(
      catchError((err: HttpErrorResponse) => {
        this._errorHandlerService.handleError(err);
        return throwError(() => err);
      })
    );
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

    return this._http
      .get<IHttpGetResponseBody<IOrganizationTableData>>(
        `${this._url}?${new URLSearchParams(params).toString()}`
      )
      .pipe(
        catchError((err: HttpErrorResponse) => {
          this._errorHandlerService.handleError(err);
          return throwError(() => err);
        })
      );
  }

  public putOrganizacao(id: number, body: FormData): Observable<IOrganization> {
    return this._http.put<IOrganization>(`${this._url}/${id}`, body).pipe(
      catchError((err: HttpErrorResponse) => {
        this._errorHandlerService.handleError(err);
        return throwError(() => err);
      })
    );
  }

  public deleteOrganizacao(id: number): Observable<string> {
    return this._http
      .delete(`${this._url}/${id}`, { responseType: 'text' })
      .pipe(
        catchError((err: HttpErrorResponse) => {
          this._errorHandlerService.handleError(err);
          return throwError(() => err);
        })
      );
  }

  public postOrganizacao(body: FormData): Observable<IOrganization> {
    return this._http.post<IOrganization>(this._url, body).pipe(
      catchError((err: HttpErrorResponse) => {
        this._errorHandlerService.handleError(err);
        return throwError(() => err);
      })
    );
  }
}
