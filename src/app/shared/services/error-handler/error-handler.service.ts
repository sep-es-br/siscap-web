import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';

import { Subject } from 'rxjs';

type ErrorHandleFn = {
  [statusCode: string]: Function;
};

@Injectable({
  providedIn: 'root',
})
export class ErrorHandlerService {
  private _errorCodesList: typeof HttpStatusCode = HttpStatusCode;

  private _errorHandleFnMap: ErrorHandleFn = {
    Unauthorized: this.handleUnauthorized,
    InternalServerError: this.handleInternalServerError,
  };

  public errorEmitter$: Subject<number | undefined> = new Subject<
    number | undefined
  >();

  constructor(private _router: Router) {}

  public handleError(error: HttpErrorResponse) {
    const errorHandleFunction =
      this._errorHandleFnMap[this._errorCodesList[error.status]] ??
      this.fallbackFuncion;

    errorHandleFunction.apply(this, [error]);
  }

  private handleUnauthorized(errorArg: HttpErrorResponse) {
    this.errorEmitter$.next(errorArg.status);
    localStorage.setItem('currentUrl', this._router.url);
    this.errorEmitter$.subscribe((value) => {
      if (!value) {
        this._router.navigateByUrl('login');
      }
    });
  }

  private handleInternalServerError(errorArg: HttpErrorResponse) {
    this.errorEmitter$.next(errorArg.status);
    this.errorEmitter$.subscribe((value) => {
      if (!value) {
        this._router.navigateByUrl('main');
      }
    });
  }

  private fallbackFuncion(errorArg: HttpErrorResponse) {
    console.log(
      `Tratamento de erro para ${errorArg.status}: ${
        this._errorCodesList[errorArg.status]
      } inexistente.`
    );
  }
}
