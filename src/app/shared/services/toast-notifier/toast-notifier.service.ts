import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';

interface IToastNotification {
  type: string;
  code?: number;
  source?: string;
  method?: string;
}

/**
 * @service
 * Serviço para emitir e receber notificações de locais diferentes da aplicação, com o propósito de alimentar `ToastComponent` e gerar um toast com as informações apropriadas.
 *
 */
@Injectable({
  providedIn: 'root',
})
export class ToastNotifierService {
  public toastNotifier$: Subject<IToastNotification> =
    new Subject<IToastNotification>();

  constructor() {}

  /**
   * @public
   * Método que emite notificação de sucesso.
   *
   * @param {string} source - Local de origem da chamada. Utilizado para extrair informação de toast de `ToastSuccessInfoMap`.
   * @param {string} method - Método da chamada. Utilizado para extrair informação de toast de `ToastSuccessInfoMap`.
   */
  public notifySuccess(source: string, method: string): void {
    this.toastNotifier$.next({
      type: 'success',
      source: source,
      method: method,
    });
  }

  /**
   * @public
   * Método que emite notificação de erro.
   *
   * @param {number} code - Código de status do erro. Utilizado para extrair informação de toast de `ToastErrorInfoMap`.
   */
  public notifyError(code: number): void {
    this.toastNotifier$.next({ type: 'error', code: code });
  }

  /**
   * @public
   * Método que emite valor falsário com o propósito de limpar o toast.
   */
  public clearNotice(): void {
    this.toastNotifier$.next({ type: '' });
  }

  /**
   * @public
   * Método para redirecionar o usuário após sucesso/erro de chamada do método.
   *
   * A lógica de redirecionamento foi centralizada neste serviço á fim de reaproveitamento.
   *
   * @param {Router} routerInstance - Instância de `Router` dentro do componente ou serviço pertinente.
   * @param {string} url - A url á ser navegada.
   * @param {boolean} samePage - Utilizado para adaptar lógica de navegação quando navegação é para a mesma página (caso `deleteProjeto`)
   */
  public redirectOnToastClose(
    routerInstance: Router,
    url: string,
    samePage?: boolean
  ): void {
    this.toastNotifier$.subscribe((notice) => {
      if (!notice.type) {
        !!samePage
          ? routerInstance
              .navigateByUrl('/', { skipLocationChange: true })
              .then(() => routerInstance.navigateByUrl(url))
          : routerInstance.navigateByUrl(url);
      }
    });
  }
}
