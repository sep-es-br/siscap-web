import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

import { Observable, catchError, throwError } from 'rxjs';

import { environment } from '../../../../environments/environment';
import {
  IOrganization,
  IOrganizationCreate,
  IOrganizationEdit,
  IOrganizationGet,
} from '../../interfaces/organization.interface';
import { ErrorHandlerService } from '../error-handler/error-handler.service';

@Injectable({
  providedIn: 'root',
})
export class OrganizacoesService {
  private _url = `${environment.apiUrl}/organizacoes`;

  constructor(
    private _http: HttpClient,
    private _errorHandlerService: ErrorHandlerService
  ) {}

  getOrganizacaoById(id: number): Observable<IOrganization> {
    return this._http.get<IOrganization>(`${this._url}/${id}`).pipe(
      catchError((err: HttpErrorResponse) => {
        this._errorHandlerService.handleError(err);
        return throwError(() => err);
      })
    );
  }

  getOrganizacaoPaginated(page?: number, pageSize?: number, sort?: string, search?: string): Observable<IOrganizationGet> {
    const params = {
      size: pageSize?.toString() ?? "15",
      page: page !== undefined ? page.toString() : "0",
      sort: sort !== undefined ? sort?.toString() : '',
      search: search !== undefined ? search.toString() : '',
    };

    return this._http.get<IOrganizationGet>(`${this._url}?${new URLSearchParams(params).toString()}` ).pipe(
      catchError((err: HttpErrorResponse) => {
        this._errorHandlerService.handleError(err);
        return throwError(() => err);
      })
    );
  }


  putOrganizacao(id: number, body: FormData): Observable<IOrganization> {
    return this._http.put<IOrganization>(`${this._url}/${id}`, body).pipe(
      catchError((err: HttpErrorResponse) => {
        this._errorHandlerService.handleError(err);
        return throwError(() => err);
      })
    );
  }

  deleteOrganizacao(id: number): Observable<string> {
    return this._http
      .delete(`${this._url}/${id}`, { responseType: 'text' })
      .pipe(
        catchError((err: HttpErrorResponse) => {
          this._errorHandlerService.handleError(err);
          return throwError(() => err);
        })
      );
  }

  getOrganizacoes(): Observable<IOrganizationGet> {
    return this._http.get<IOrganizationGet>(this._url).pipe(
      catchError((err: HttpErrorResponse) => {
        this._errorHandlerService.handleError(err);
        return throwError(() => err);
      })
    );
  }

  postOrganizacao(body: FormData): Observable<IOrganization> {
    return this._http.post<IOrganization>(this._url, body).pipe(
      catchError((err: HttpErrorResponse) => {
        this._errorHandlerService.handleError(err);
        return throwError(() => err);
      })
    );
  }
}
