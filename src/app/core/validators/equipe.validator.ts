import {
  AbstractControl,
  FormArray,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';

import { EquipeFormType } from '../types/form/equipe-form.type';

function equipeValidator_MembroEquipeSemPapel(
  equipeControls: Array<FormGroup<EquipeFormType>>
): boolean {
  if (equipeControls.length === 0) {
    return false;
  }

  return equipeControls.some(
    (membroFormGroup) => !membroFormGroup.controls.idPapel.value
  );
}

export function equipeValidator(): ValidatorFn {
  return (control: AbstractControl<any, any>): ValidationErrors | null => {
    const equipeFormArray: FormArray<FormGroup<EquipeFormType>> =
      control as FormArray<FormGroup<EquipeFormType>>;

    if (equipeValidator_MembroEquipeSemPapel(equipeFormArray.controls)) {
      return { membroEquipeSemPapel: true };
    }

    return null;
  };
}
