import { Component, Input } from '@angular/core';
import { AbstractControl } from '@angular/forms';

@Component({
  selector: 'app-alert',
  standalone: false,
  templateUrl: './alert.component.html',
  styleUrl: './alert.component.css',
})
export class AlertComponent {
  @Input('control') control: AbstractControl<any, any> | undefined;

  constructor() {}

  formControlErrorMap(control?: AbstractControl): string {
    if (control?.errors) {
      return Object.keys(control?.errors)
        .map((controlError) => {
          switch (controlError) {
            case 'required':
              return 'Campo obrigatório';
            case 'email':
              return 'Email inválido';
            case 'maxlength':
              return 'Tamanho acima do limite';
            case 'minlength':
              return 'Tamanho abaixo do limite';
            case 'max':
              return 'Valor superior ao limite';
            case 'min':
              return 'Valor inferior ao limite';
            default:
              return '';
          }
        })
        .join(', ');
    }

    return '';
  }
}
