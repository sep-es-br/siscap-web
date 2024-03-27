import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';

import { ToastNotifierService } from '../toast-notifier/toast-notifier.service';

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

  constructor(
    private _toastNotifierService: ToastNotifierService,
    private _router: Router
  ) {}

  public handleError(error: HttpErrorResponse) {
    const errorHandleFunction =
      this._errorHandleFnMap[this._errorCodesList[error.status]] ??
      this.fallbackFuncion;

    errorHandleFunction.apply(this, [error]);
  }

  private handleUnauthorized(errorArg: HttpErrorResponse) {
    this._toastNotifierService.notifyError(errorArg.status);

    localStorage.setItem('currentUrl', this._router.url);

    this._toastNotifierService.redirectOnToastClose(this._router, 'login');
  }

  private handleInternalServerError(errorArg: HttpErrorResponse) {
    this._toastNotifierService.notifyError(errorArg.status);

    this._toastNotifierService.redirectOnToastClose(this._router, 'main');
  }

  private fallbackFuncion(errorArg: HttpErrorResponse) {
    console.log(
      `Tratamento de erro para ${errorArg.status}: ${
        this._errorCodesList[errorArg.status]
      } inexistente.`
    );
    console.log(errorArg);
  }
}
