import { Component } from '@angular/core';

import { ToastService } from '../../../shared/services/toast/toast.service';

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
    success: 'bg-success-subtle',
    error: 'bg-danger-subtle',
    warning: 'bg-warning-subtle',
    info: 'bg-info-subtle',
  };

  constructor(public toastService: ToastService) {}
}
