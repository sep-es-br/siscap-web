import { Router } from '@angular/router';

import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';

// const toastComponent = document.getElementById('testToast');

type ErrorHandleFn = {
  [statusCode: string]: Function;
};

export class SiscapErrorHandler {
  private _errorCodesList: typeof HttpStatusCode = HttpStatusCode;

  private _errorHandleFnMap: ErrorHandleFn = {
    Unauthorized: this.handleUnauthorized,
    InternalServerError: this.handleInternalServerError,
  };

  private _error: HttpErrorResponse;
  private _router: Router;

  constructor(httpError: HttpErrorResponse, routerInstance: Router) {
    this._error = httpError;
    this._router = routerInstance;
  }

  public handleError(): void {
    // console.log(this._error);
    // console.log(this._error.status);
    // console.log(this._errorCodesList[this._error.status]);
    // console.log(
    //   this._errorHandleFnMap[this._errorCodesList[this._error.status]]
    // );

    const errorHandleFunction =
      this._errorHandleFnMap[this._errorCodesList[this._error.status]] ??
      this.fallbackFuncion;

    errorHandleFunction.apply(this);
  }

  private handleUnauthorized() {
    alert('Token de autenticação expirada. Por favor faça o login novamente.');
    localStorage.setItem('currentUrl', this._router.url);
    this._router.navigateByUrl('login');
  }

  private handleInternalServerError() {
    alert(
      'Houve um problema ao processar a requisição. Entre em contato com a equipe de suporte.'
    );
    console.log(this._error.error);
  }

  private fallbackFuncion() {
    console.log(
      `Tratamento de erro para ${this._error.status}: ${
        this._errorCodesList[this._error.status]
      } inexistente.`
    );
  }
}
