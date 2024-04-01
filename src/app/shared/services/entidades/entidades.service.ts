import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

import { Observable, catchError, throwError } from 'rxjs';

import { environment } from '../../../../environments/environment';
import {
  IEntity,
  IEntityCreate,
  IEntityEdit,
  IEntityGet,
} from '../../interfaces/entity.interface';
import { ErrorHandlerService } from '../error-handler/error-handler.service';

@Injectable({
  providedIn: 'root',
})
export class EntidadesService {
  private _url = `${environment.apiUrl}/entidades`;

  constructor(
    private _http: HttpClient,
    private _errorHandlerService: ErrorHandlerService
  ) {}

  getEntidadeById(id: number): Observable<IEntity> {
    return this._http.get<IEntity>(`${this._url}/${id}`).pipe(
      catchError((err: HttpErrorResponse) => {
        this._errorHandlerService.handleError(err);
        return throwError(() => err);
      })
    );
  }

  putEntidade(id: number, body: FormData): Observable<IEntity> {
    return this._http.put<IEntity>(`${this._url}/${id}`, body).pipe(
      catchError((err: HttpErrorResponse) => {
        this._errorHandlerService.handleError(err);
        return throwError(() => err);
      })
    );
  }

  deleteEntidade(id: number): Observable<string> {
    return this._http
      .delete(`${this._url}/${id}`, { responseType: 'text' })
      .pipe(
        catchError((err: HttpErrorResponse) => {
          this._errorHandlerService.handleError(err);
          return throwError(() => err);
        })
      );
  }

  getEntidades(): Observable<IEntityGet> {
    return this._http.get<IEntityGet>(this._url).pipe(
      catchError((err: HttpErrorResponse) => {
        this._errorHandlerService.handleError(err);
        return throwError(() => err);
      })
    );
  }

  postEntidade(body: FormData): Observable<IEntity> {
    return this._http.post<IEntity>(this._url, body).pipe(
      catchError((err: HttpErrorResponse) => {
        this._errorHandlerService.handleError(err);
        return throwError(() => err);
      })
    );
  }
}
