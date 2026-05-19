import {
  AbstractControl,
  FormArray,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';

import { EquipeFormType } from '../types/form/equipe-form.type';
import { TipoEquipeEnum } from '../enums/tipo-equipe.enum';
import { TipoStatusEnum } from '../enums/tipo-status.enum';

function equipeValidator_MembroEquipeSemPapel(
  equipeControls: Array<FormGroup<EquipeFormType>>
): boolean {
  if (equipeControls.length === 0) {
    return false;
  }

  return equipeControls.filter(m => m.getRawValue().idStatus == TipoStatusEnum.Ativo).some(
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

    if (!equipeValidator_MembrosEquipeSemAtivos(equipeFormArray.controls)) {
      return { equipeSemMembroAtivo: true };
    }

    return null;

  };
}

function equipeValidator_MembrosEquipeSemAtivos(
  equipeControls: Array<FormGroup<EquipeFormType>>
): boolean {
  if (equipeControls.length === 0) {
    return false;
  }

  return equipeControls.some(
    (membroFormGroup) => membroFormGroup.controls.idStatus.value == TipoStatusEnum.Ativo
  );
}
