import { Component } from '@angular/core';

import { ToastNotifierService } from '../../shared/services/toast-notifier/toast-notifier.service';
import {
  ToastErrorInfoMap,
  ToastSuccessInfoMap,
} from '../../shared/utils/toast-info-map';

interface IDisplayToast {
  error: boolean;
  success: boolean;
  warning: boolean;
  info: boolean;
}

@Component({
  selector: 'siscap-toast',
  standalone: false,
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.scss',
})
export class ToastComponent {
  public displayToast: IDisplayToast = {
    error: false,
    success: false,
    warning: false,
    info: false,
  };

  public toastHeader: string = '';
  public toastBody: string = '';
  public toastDelay: number = 6000;

  constructor(private _toastNotifierService: ToastNotifierService) {
    this._toastNotifierService.toastNotifier$.subscribe((notice) => {
      switch (notice.type) {
        case 'error':
          const toastErrorInfo = ToastErrorInfoMap[notice.code!];
          this.toastHeader = toastErrorInfo.header;
          this.toastBody = toastErrorInfo.body;
          this.toastDelay = toastErrorInfo.delay ?? 6000;
          this.displayToast.error = true;
          break;

        case 'success':
          const toastSuccessInfo =
            ToastSuccessInfoMap[notice.source!][notice.method!];
          this.toastHeader = 'Sucesso';
          this.toastBody = toastSuccessInfo.body;
          this.toastDelay = toastSuccessInfo.delay ?? 6000;
          this.displayToast.success = true;
          break;

        default:
          break;
      }
    });
  }

  public resetToast() {
    for (const key in this.displayToast) {
      this.displayToast[key as keyof typeof this.displayToast] = false;
    }

    this.toastHeader = '';
    this.toastBody = '';
    this._toastNotifierService.notifyToast('');
  }
}
