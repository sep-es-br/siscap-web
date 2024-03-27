import { Component } from '@angular/core';

import { ToastNotifierService } from '../../shared/services/toast-notifier/toast-notifier.service';
import {
  ToastErrorInfoMap,
  ToastSuccessInfoMap,
} from '../../shared/utils/toast-info-map';

@Component({
  selector: 'siscap-toast',
  standalone: false,
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.scss',
})
export class ToastComponent {
  public displayErrorToast: boolean = false;
  public displaySuccessToast: boolean = false;
  public toastHeader: string = '';
  public toastBody: string = '';

  constructor(private _toastNotifierService: ToastNotifierService) {
    this._toastNotifierService.toastNotifier$.subscribe((notice) => {
      if (notice.type === 'error') {
        const toastErrorInfo = ToastErrorInfoMap[notice.code!];
        this.toastHeader = toastErrorInfo.header;
        this.toastBody = toastErrorInfo.body;
        this.displayErrorToast = true;
      }

      if (notice.type === 'success') {
        const toastSuccessInfo =
          ToastSuccessInfoMap[notice.source!][notice.method!];
        this.toastHeader = 'Sucesso';
        this.toastBody = toastSuccessInfo.body;
        this.displaySuccessToast = true;
      }
    });
  }

  public resetToast() {
    this.displayErrorToast = false;
    this.displaySuccessToast = false;
    this.toastHeader = '';
    this.toastBody = '';
    this._toastNotifierService.notifyToast('');
  }
}
