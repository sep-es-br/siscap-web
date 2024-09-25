import { Component, Input } from '@angular/core';
import { AbstractControl, ValidationErrors, Validators } from '@angular/forms';

import { COLECAO_ERRO_MENSAGEM } from '../../../core/utils/constants';

@Component({
  selector: 'validation-message',
  standalone: false,
  templateUrl: './validation-message.component.html',
})
export class ValidationMessageComponent {
  @Input('control') public abstractControl!: AbstractControl<any, any>;

  public isRequired: boolean = false;

  private _errorMessageMap: Record<string, string> = COLECAO_ERRO_MENSAGEM;

  constructor() {}

  ngOnInit(): void {
    this.isRequired = this.abstractControl.hasValidator(Validators.required);
  }

  public mapErrorMessages(errors: ValidationErrors | null): string {
    if (!errors) {
      return '';
    }

    return Object.keys(errors)
      .map((errorKey) => this._errorMessageMap[errorKey])
      .join(' | ');
  }
}
