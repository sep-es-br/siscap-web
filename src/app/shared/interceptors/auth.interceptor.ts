import { Injectable, Provider } from '@angular/core';
import {
  HTTP_INTERCEPTORS,
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';

import { catchError, Observable, throwError } from 'rxjs';

import { ErrorHandlerService } from '../services/error-handler/error-handler.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private _errorHandlerService: ErrorHandlerService) {}

  public intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const reqClone = req.clone({
      headers: req.headers.set(
        'Authorization',
        `Bearer ${sessionStorage.getItem('token')}`
      ),
      responseType: 'json',
    });

    return next.handle(reqClone).pipe(
      catchError((error: HttpErrorResponse) => {
        this._errorHandlerService.handleError(error);
        return throwError(() => error);
      })
    );
  }
}

export const authInterceptorProvider: Provider = {
  provide: HTTP_INTERCEPTORS,
  useClass: AuthInterceptor,
  multi: true,
};
