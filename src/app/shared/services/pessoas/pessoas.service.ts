import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

import { Observable, catchError, throwError } from 'rxjs';

import { environment } from '../../../../environments/environment';
import {
  IPerson,
  IPersonCreate,
  IPersonEdit,
  IPersonGet,
} from '../../interfaces/person.interface';
import { ErrorHandlerService } from '../error-handler/error-handler.service';

@Injectable({
  providedIn: 'root',
})
export class PessoasService {
  private _url = `${environment.apiUrl}/pessoas`;

  constructor(
    private _http: HttpClient,
    private _errorHandlerService: ErrorHandlerService
  ) {}

  getPessoaById(id: number): Observable<IPerson> {
    return this._http.get<IPerson>(`${this._url}/${id}`).pipe(
      catchError((err: HttpErrorResponse) => {
        this._errorHandlerService.handleError(err);
        return throwError(() => err);
      })
    );
  }

  getPessoaPaginated(page?: number, pageSize?: number, sort?: string, search?: string): Observable<IPersonGet> {
    const params = {
      size: pageSize?.toString() ?? "15",
      page: page !== undefined ? page.toString() : "0",
      sort: sort !== undefined ? sort?.toString() : '',
      search: search !== undefined ? search.toString() : '', // Ensure search is always a string
    };

    return this._http.get<IPersonGet>(`${this._url}?${new URLSearchParams(params).toString()}` ).pipe(
      catchError((err: HttpErrorResponse) => {
        this._errorHandlerService.handleError(err);
        return throwError(() => err);
      })
    );
  }

  putPessoa(id: number, body: FormData): Observable<IPerson> {
    return this._http.put<IPerson>(`${this._url}/${id}`, body).pipe(
      catchError((err: HttpErrorResponse) => {
        this._errorHandlerService.handleError(err);
        return throwError(() => err);
      })
    );
  }

  deletePessoa(id: number): Observable<string> {
    return this._http
      .delete(`${this._url}/${id}`, { responseType: 'text' })
      .pipe(
        catchError((err: HttpErrorResponse) => {
          this._errorHandlerService.handleError(err);
          return throwError(() => err);
        })
      );
  }

  // TODO: Ver como anexar body no get (IHttpGetRequestBody)
  getPessoas(): Observable<IPersonGet> {
    console.log("Get pessoas");
    return this._http.get<IPersonGet>(this._url).pipe(
      catchError((err: HttpErrorResponse) => {
        this._errorHandlerService.handleError(err);
        return throwError(() => err);
      })
    );
  }

  postPessoa(body: FormData): Observable<IPerson> {
    return this._http.post<IPerson>(this._url, body).pipe(
      catchError((err: HttpErrorResponse) => {
        this._errorHandlerService.handleError(err);
        return throwError(() => err);
      })
    );
  }

  getPessoaByEmail(email: string): Observable<IPerson> {
    const params = {
      email: email,
    };

    return this._http
      .get<IPerson>(`${this._url}/email`, { params: params })
      .pipe(
        catchError((err: HttpErrorResponse) => {
          this._errorHandlerService.handleError(err);
          return throwError(() => err);
        })
      );
  }
}
