import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { AbstractControl, FormControl } from '@angular/forms';

@Component({
  selector: 'app-alert',
  standalone: false,
  templateUrl: './alert.component.html',
  styleUrl: './alert.component.css',
})
export class AlertComponent {
  @Input('control') control!: AbstractControl<any, any>;

  constructor() {}

  formControlErrorMap(control: AbstractControl): string {
    if (control.errors) {
      return Object.keys(control.errors)
        .map((controlError) => {
          switch (controlError) {
            case 'required':
              return 'Campo obrigatório';
            case 'email':
              return 'Email inválido';

            default:
              return '';
          }
        })
        .join(', ');
    }

    return '';
  }
}
