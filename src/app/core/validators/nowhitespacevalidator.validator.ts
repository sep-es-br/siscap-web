import { AbstractControl, FormArray, FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';

import { AcaoFormType } from '../types/form/acao-form.type';
import { AcoesService } from '../services/acoes/acoes.service';

export function noWhitespaceValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const valor = control.value;

    if (typeof valor === 'string' && valor.trim().length === 0 && valor.length > 0) {
      return { whitespace: true };
    }

    return null;
  };
}
