import { Injectable } from '@angular/core';
import { AbstractControl, FormBuilder, Validators } from '@angular/forms';

import { projectCreateModel } from '../../models/projectCreate.model';

@Injectable({
  providedIn: 'root',
})
export class FormFactoryService {
  constructor(private _fb: FormBuilder) {}

  /**
   * Método para gerar os validadores dos controles a partir do objeto modelo.
   *
   * @param {AbstractControl} control - O controle na qual serão inserido os validadores.
   *
   * @param {Object} validator - Objeto contendo os pares chave/valor do controle,
   * onde chave é o nome do validador e o valor é argumento do validador.
   *
   * Nos casos onde o validador não requer o instanceamento do método (ex: `required`),
   * o valor pode ser ignorado.
   *
   * @usageNotes
   *
   * ```typescript
   * nome_do_controle: {validators: {required: true}}
   * .
   * .
   * .
   * case 'required':
   *  control.addValidators(Validators.required) //valor true do objeto foi omitido
   *  break;
   * ```
   *
   */
  generateValidators(control: AbstractControl, validator: Object): void {
    for (const [key, value] of Object.entries(validator)) {
      switch (key) {
        case 'min':
          control.addValidators(Validators.min(value));
          break;

        case 'max':
          control.addValidators(Validators.max(value));
          break;

        case 'minLength':
          control.addValidators(Validators.minLength(value));
          break;

        case 'maxLength':
          control.addValidators(Validators.maxLength(value));
          break;

        case 'required':
          control.addValidators(Validators.required);
          break;

        case 'requiredTrue':
          control.addValidators(Validators.requiredTrue);
          break;

        case 'pattern':
          control.addValidators(Validators.pattern(value));
          break;

        default:
          break;
      }
    }

    control.updateValueAndValidity();
  }

  /**
   * Método para gerar o formulário a partir de um objeto modelo.
   *
   * @param {projectCreateModel} targetObject - Objeto modelo contendo valor inicial e um objeto aninhado opcional com os validadores.
   *
   * @returns Formulário do tipo `FormGroup`
   */
  generateForm(targetObject: projectCreateModel) {
    const form = this._fb.group({});

    for (const [key, value] of Object.entries(targetObject)) {
      form.addControl(key, this._fb.control(value.initialValue));
      this.generateValidators(form.get(key)!, value.validators);
    }

    return form;
  }
}
