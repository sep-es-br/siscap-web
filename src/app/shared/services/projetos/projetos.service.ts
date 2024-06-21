import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpResponse } from '@angular/common/http';

import { Observable, catchError, throwError } from 'rxjs';

import { environment } from '../../../../environments/environment';
import {
  IProject,
  IProjectCreate,
  IProjectEdit,
  IProjectGet,
} from '../../interfaces/project.interface';
import { ErrorHandlerService } from '../error-handler/error-handler.service';

@Injectable({
  providedIn: 'root',
})
export class ProjetosService {
  private _url = `${environment.apiUrl}/projetos`;

  constructor(
    private _http: HttpClient,
    private _errorHandlerService: ErrorHandlerService
  ) {}

  getProjetoById(id: number): Observable<IProject> {
    return this._http.get<IProject>(`${this._url}/${id}`).pipe(
      catchError((err: HttpErrorResponse) => {
        this._errorHandlerService.handleError(err);
        return throwError(() => err);
      })
    );
  }

  getProjetosPaginated(page?: number, pageSize?: number, sort?: string, search?: string): Observable<IProjectGet> {
    const params = {
      size: pageSize?.toString() ?? "15",
      page: page !== undefined ? page.toString() : "0",
      sort: sort !== undefined ? sort?.toString() : '',
      search: search !== undefined ? search.toString() : '',
    };

    return this._http.get<IProjectGet>(`${this._url}?${new URLSearchParams(params).toString()}` ).pipe(
      catchError((err: HttpErrorResponse) => {
        this._errorHandlerService.handleError(err);
        return throwError(() => err);
      })
    );
  }

  putProjeto(id: number, body: IProjectEdit): Observable<IProject> {
    return this._http.put<IProject>(`${this._url}/${id}`, body).pipe(
      catchError((err: HttpErrorResponse) => {
        this._errorHandlerService.handleError(err);
        return throwError(() => err);
      })
    );
  }

  deleteProjeto(id: number): Observable<string> {
    return this._http
      .delete(`${this._url}/${id}`, { responseType: 'text' })
      .pipe(
        catchError((err: HttpErrorResponse) => {
          this._errorHandlerService.handleError(err);
          return throwError(() => err);
        })
      );
  }

  getProjetos(): Observable<IProjectGet> {
    return this._http.get<IProjectGet>(this._url).pipe(
      catchError((err: HttpErrorResponse) => {
        this._errorHandlerService.handleError(err);
        return throwError(() => err);
      })
    );
  }

  postProjeto(body: IProjectCreate): Observable<IProject> {
    return this._http.post<IProject>(this._url, body).pipe(
      catchError((err: HttpErrorResponse) => {
        this._errorHandlerService.handleError(err);
        return throwError(() => err);
      })
    );
  }

  downloadDIC(id: number): Observable<HttpResponse<Blob>> {
    return this._http.get(`${this._url}/dic/${id}`, {responseType: 'blob', observe: 'response'}).pipe(
      catchError((err: HttpErrorResponse) => {
        this._errorHandlerService.handleError(err);
        return throwError(() => err);
      })
    );
  }
}
