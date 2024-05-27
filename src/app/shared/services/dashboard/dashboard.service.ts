import {Injectable} from '@angular/core';
import {HttpBackend, HttpClient, HttpErrorResponse,} from '@angular/common/http';

import {catchError, Observable, throwError,} from 'rxjs';

import {ErrorHandlerService} from '../error-handler/error-handler.service';

import {IDashboardProjeto,} from '../../interfaces/dashboard.interface';
import {environment} from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private _url = `${environment.apiUrl}/dashboard`;

  constructor(
    private _http: HttpClient,
    private _handler: HttpBackend,
    private _errorHandlerService: ErrorHandlerService
  ) {}

  getQuantidadeProjetos(): Observable<IDashboardProjeto> {
    return this._http.get<IDashboardProjeto>(`${this._url}`).pipe(
      catchError((err: HttpErrorResponse) => {
        this._errorHandlerService.handleError(err);
        return throwError(() => err);
      })
    )
  }

}
