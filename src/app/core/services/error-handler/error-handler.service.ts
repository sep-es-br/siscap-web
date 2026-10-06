import { MENSAGENS } from '../../utils/constants';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

import { ToastService } from '../toast/toast.service';

import { IHttpBackEndErrorResponse } from '../../interfaces/http-backend-error-response.interface';

/**
 * @service
 * Serviço para tratar erros de HTTP dentro do sistema. Recolhe erros e utiliza um serviço de toast (`ToastService`) para oferecer feedback ao usuário.
 */
@Injectable({
  providedIn: 'root',
})
export class ErrorHandlerService {
  constructor(private _toastService: ToastService, private _router: Router) { }

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
    if (error.status === 0) {
      this.showDefaultErrorToast();
    } else {
      this.showBackEndErrorToast(error.error);
      this.handleRouting(error);
    }
  }

  private showDefaultErrorToast(): void {
    this._toastService.showToast('error', MENSAGENS.ERRO_AO_PROCESSAR_A_REQUISICAO, [
      MENSAGENS.VERIFIQUE_SUA_CONEXAO_COM_A_INTERNET,
      MENSAGENS.CASO_O_ERRO_PERSISTA_CONTATE_O_SUPORTE,
    ]);
  }

  private showBackEndErrorToast(backEndError: IHttpBackEndErrorResponse): void {
    this._toastService.showToast(
      'error',
      backEndError.mensagem,
      backEndError.erros
    );
  }

  private handleRouting(error: HttpErrorResponse): void {

    const isErroTokenEdocs = error.status === 401 && error.error?.titulo === 'EDOCS_TOKEN_EXPIRADO';

    if (isErroTokenEdocs) {
      this._toastService.showToast(
        'error',
        error.error?.erros?.[0] ??
        MENSAGENS.SUA_PERMISSAO_DE_ACESSO_AO_E_DOCS_EXPIROU_VOCE_SERA_REDIRECIONADO_PARA_O_LOGIN
      );

      setTimeout(() => {
        this._router.navigateByUrl('login');
      }, 2000);

      return;

    }

    switch (error.status) {
      case 401:

        console.log('Router URL:', this._router.url);
        console.log('pathname:', window.location.pathname);
        console.log('search:', window.location.search);
        console.log('hash:', window.location.hash);
        console.log('href:', window.location.href);

        localStorage.setItem('redirectUrl', this._router.url);

        this._router.navigateByUrl('login');

        break;

      case 403:
        this._router.navigateByUrl('main');
        break;
      default:
        break;
    }

  }
}
