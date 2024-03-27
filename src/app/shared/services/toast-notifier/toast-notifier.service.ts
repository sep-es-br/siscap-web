import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { Subject, finalize, takeWhile } from 'rxjs';

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
   * Método que notifica o toast sobre informações relativas á erros, sucessos, etc.
   *
   * @param {string} type - O tipo de notificação. (ex: 'success', 'error', etc.)
   * @param {number} code - O código de erro quando notificação for de erro; `undefined` caso notificação seja de outro tipo.
   * @param {string} source - O local de onde a notificação está sendo emitida quando a notificação for de sucesso; `undefined` caso notificação seja de outro tipo.
   * @param {string} method - O tipo de método da qual a notificação está sendo emitida quando a notificação for de sucesso; `undefined` caso notificação seja de outro tipo.
   */
  public notifyToast(
    type: string,
    code?: number,
    source?: string,
    method?: string
  ): void {
    const toastNotificationObject: IToastNotification = {
      type: type,
      code: code ?? undefined,
      source: source ?? undefined,
      method: method ?? undefined,
    };

    this.toastNotifier$.next(toastNotificationObject);
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
    this.toastNotifier$
      .pipe(
        takeWhile((notice) => notice.type !== ''),
        finalize(() => {
          !!samePage
            ? routerInstance
                .navigateByUrl('/', { skipLocationChange: true })
                .then(() => routerInstance.navigateByUrl(url))
            : routerInstance.navigateByUrl(url);
        })
      )
      .subscribe();
  }
}
