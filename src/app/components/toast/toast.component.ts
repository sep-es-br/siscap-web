import { Component } from '@angular/core';

import { ErrorHandlerService } from '../../shared/services/error-handler/error-handler.service';
import { ToastErrorInfoMap } from '../../shared/utils/toast-error-info-map';

@Component({
  selector: 'siscap-toast',
  standalone: false,
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.scss',
})
export class ToastComponent {
  public displayToast: boolean = false;
  public toastHeader: string = '';
  public toastBody: string = '';

  constructor(private _errorHandlerService: ErrorHandlerService) {
    this._errorHandlerService.errorEmitter$.subscribe((value) => {
      if (value) {
        const toastErrorInfo = ToastErrorInfoMap[value];
        this.toastHeader = toastErrorInfo.header;
        this.toastBody = toastErrorInfo.body;
        this.displayToast = true;
      }
    });
  }

  public resetToast() {
    this.displayToast = false;
    this.toastHeader = '';
    this.toastBody = '';
    this._errorHandlerService.errorEmitter$.next(undefined);
  }
}
