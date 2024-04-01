import { Component } from '@angular/core';

import { ToastService } from '../../shared/services/toast/toast.service';

interface IToastStyleClass {
  [type: string]: string;
}

@Component({
  selector: 'siscap-toast',
  standalone: false,
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.scss',
})
export class ToastComponent {
  public bgStyleMap: IToastStyleClass = {
    success: 'bg-success-subtle bottom-0 end-0',
    error: 'bg-danger-subtle top-0 end-0',
    warning: 'bg-warning-subtle top-0 start-50',
    info: 'bg-info-subtle top-0 start-0',
  };

  constructor(public toastService: ToastService) {}
}
