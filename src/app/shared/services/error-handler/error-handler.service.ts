import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';

import { ToastService } from '../toast/toast.service';
import { ToastErrorInfoMap } from '../../utils/toast-info-map';

interface IHandleErrorOptions {
  [status: string]: Function;
}

/**
 * @service
 * Serviço para tratar erros de HTTP dentro do sistema. Recolhe erros e utiliza um serviço de toast (`ToastService`) para oferecer feedback ao usuário.
 */
@Injectable({
  providedIn: 'root',
})
export class ErrorHandlerService {
  private _errorCodesList: typeof HttpStatusCode = HttpStatusCode;

  private _handleErrorOptions: IHandleErrorOptions = {
    BadRequest: this.handleBadRequestOptions,
    Unauthorized: this.handleUnauthorizedOptions,
    InternalServerError: this.handleInternalServerErrorOptions,
  };

  constructor(private _toastService: ToastService, private _router: Router) {}
  /**
   * @public
   * Método público invocado dentro dos métodos apropriados dos serviços (ex: `getProjeto` dentro de `ProjetosService`).
   *
   * Cria um toast pelo serviço `ToastService` com as informações provenientes do mapa `ToastErrorInfoMap`. Caso o erro não esteja mapeado,
   * apenas registra o erro no console.
   *
   * Ao momento que o toast expirar ou ser fechado pelo usuário,
   * recebe notificação do `Subject` do serviço e executa métodos opcionais de acordo com o erro, providos em `_handleErrorOptions`.
   *
   * @param {HttpErrorResponse} error - O erro fornecido pelo seletor do operador RxJS `catchError`.
   */
  public handleError(error: HttpErrorResponse): void {
    const toastErrorInfo = ToastErrorInfoMap[error.status] ?? undefined;

    if (toastErrorInfo) {
      this._toastService.showToast(toastErrorInfo);

      const handleErrorOptionsFunction =
        this._handleErrorOptions[this._errorCodesList[error.status]];

      this._toastService.toastNotifier$.subscribe((value) => {
        if (value) {
          handleErrorOptionsFunction.apply(this);
        }
      });
    } else {
      console.log(
        `Tratamento de erro para ${error.status}: ${
          this._errorCodesList[error.status]
        } inexistente.`
      );
      console.log(error);
    }
  }

  /**
   * @private
   * Navega o usuário para a página principal.
   */
  private handleBadRequestOptions(): void {
    this._router.navigateByUrl('main');
  }

  /**
   * @private
   * Armazena a url atual em `sessionStorage` e navega o usuário para a página de login.
   * Lógica de redirecionamento é aplicada no componente `AuthRedirectComponent`.
   */
  private handleUnauthorizedOptions(): void {
    sessionStorage.setItem('currentUrl', this._router.url);
    this._router.navigateByUrl('login');
  }

  /**
   * @private
   * Navega o usuário para a página principal.
   */
  private handleInternalServerErrorOptions(): void {
    this._router.navigateByUrl('main');
  }
}
