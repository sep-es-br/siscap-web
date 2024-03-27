import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';

import { ToastNotifierService } from '../toast-notifier/toast-notifier.service';

type ErrorHandleFn = {
  [statusCode: string]: Function;
};

/**
 * @service
 * Serviço para tratar erros de HTTP dentro do sistema. Recolhe erros e utiliza um serviço de notificação (`ToastNotifierService`) para oferecer feedback ao usuário.
 */
@Injectable({
  providedIn: 'root',
})
export class ErrorHandlerService {
  private _errorCodesList: typeof HttpStatusCode = HttpStatusCode;

  private _errorHandleFnMap: ErrorHandleFn = {
    Unauthorized: this.handleUnauthorized,
    InternalServerError: this.handleInternalServerError,
    BadRequest: this.handleBadRequest,
  };

  constructor(
    private _toastNotifierService: ToastNotifierService,
    private _router: Router
  ) {}
  /**
   * @public
   * Método público invocado dentro dos métodos apropriados (ex: `getProjeto` dentro de `ProjetosService`).
   *
   * Itera por um mapa contendo métodos apropriados para cada tipo de erro, utilizando o código de status do erro (`error.status`).
   * O retorno do mapa é uma função, que é chamada através de `Function.apply()` passando `this` como escopo da função de `[error]` como array de argumentos á serem substituídos.
   * No caso desse serviço, apenas o erro original `error` é passado.
   *
   * @param {HttpErrorResponse} error - O erro fornecido pelo seletor do operador RxJS `catchError`.
   */
  public handleError(error: HttpErrorResponse): void {
    const errorHandleFunction =
      this._errorHandleFnMap[this._errorCodesList[error.status]] ??
      this.fallbackFuncion;

    errorHandleFunction.apply(this, [error]);
  }

  /**
   * @private
   * Método que lida com o erro 401 - `Unauthorized`.
   *
   * Armazena o caminho local para redirecionar o usuário após ele refazer o login.
   *
   * @param {HttpErrorResponse} errorArg - Argumento local de erro, substituido pelo erro original da chamada `Function.apply()` de `handleError()`.
   */
  private handleUnauthorized(errorArg: HttpErrorResponse): void {
    this._toastNotifierService.notifyToast('error', errorArg.status);

    sessionStorage.setItem('currentUrl', this._router.url);

    this._toastNotifierService.redirectOnToastClose(this._router, 'login');
  }

  /**
   * @private
   * Método que lida com o erro 500 - `Internal Server Error`.
   *
   * Apenas notifica o usuário do erro através de um toast e o redireciona para a página principal.
   *
   * @param {HttpErrorResponse} errorArg - Argumento local de erro, substituido pelo erro original da chamada `Function.apply()` de `handleError()`.
   */
  private handleInternalServerError(errorArg: HttpErrorResponse): void {
    this._toastNotifierService.notifyToast('error', errorArg.status);

    this._toastNotifierService.redirectOnToastClose(this._router, 'main');
  }

  /**
   * @private
   * Método que lida com o erro 400 - `Bad Request`.
   *
   * Apenas notifica o usuário do erro através de um toast e o redireciona para a página principal.
   *
   * @param {HttpErrorResponse} errorArg - Argumento local de erro, substituido pelo erro original da chamada `Function.apply()` de `handleError()`.
   */
  private handleBadRequest(errorArg: HttpErrorResponse): void {
    this._toastNotifierService.notifyToast('error', errorArg.status);

    this._toastNotifierService.redirectOnToastClose(this._router, 'main');
  }

  /**
   * @private
   * Método de fallback caso o erro fornecido não seja contemplado em `errorHandleFnMap`.
   *
   * @param {HttpErrorResponse} errorArg - Argumento local de erro, substituido pelo erro original da chamada `Function.apply()` de `handleError()`.
   */
  private fallbackFuncion(errorArg: HttpErrorResponse): void {
    console.log(
      `Tratamento de erro para ${errorArg.status}: ${
        this._errorCodesList[errorArg.status]
      } inexistente.`
    );
    console.log(errorArg);
  }
}
