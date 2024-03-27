import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';

interface IToastNotification {
  type: string;
  code?: number | undefined;
  source?: string;
  method?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ToastNotifierService {
  public toastNotifier$: Subject<IToastNotification> =
    new Subject<IToastNotification>();

  constructor() {}

  public notifySuccess(source: string, method: string) {
    this.toastNotifier$.next({
      type: 'success',
      source: source,
      method: method,
    });
  }

  public notifyError(code: number | undefined) {
    this.toastNotifier$.next({ type: 'error', code: code });
  }

  public clearNotice() {
    this.toastNotifier$.next({ type: '' });
  }

  public redirectOnToastClose(
    routerInstance: Router,
    url: string,
    samePage?: boolean
  ) {
    this.toastNotifier$.subscribe((notice) => {
      console.log(!!samePage);
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
