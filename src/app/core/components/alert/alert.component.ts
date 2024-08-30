import { Component, Input } from '@angular/core';
import { AbstractControl, Validators } from '@angular/forms';

import { ErrorMessageMap } from '../../../shared/utils/error-messages-map';

@Component({
  selector: 'siscap-alert',
  standalone: false,
  templateUrl: './alert.component.html',
  styleUrl: './alert.component.scss',
})
export class AlertComponent {
  @Input('control') control: AbstractControl<any, any> | null = null;

  public isRequired: boolean = false;

  constructor() {
    //Workaround para inicialização do componente
    setTimeout(() => {
      this.isRequired =
        this.control?.hasValidator(Validators.required) ?? false;
    }, 1);
  }

  public formControlErrorMap(
    control: AbstractControl<any, any> | null
  ): string {
    if (control?.errors) {
      return Object.keys(control?.errors)
        .map(
          (controlError) =>
            ErrorMessageMap[controlError as keyof typeof ErrorMessageMap]
        )
        .join(', ');
    }

    return '';
  }
}
