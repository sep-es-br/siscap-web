import { ValidationErrors } from '@angular/forms';

import { RateioLocalidadeFormTypeValue } from '../types/form/rateio-form.type';

import { RateioCalculoHelper } from '../helpers/rateio-calculo.helper';

export function limiteRateioValidator(
  quantiaFormControlValue: number | null,
  rateioFormArrayValue: Array<RateioLocalidadeFormTypeValue>
): ValidationErrors | null {
  if (!quantiaFormControlValue || rateioFormArrayValue.length === 0)
    return null;

  const [totalPercentual, totalQuantia] =
    RateioCalculoHelper.calcularTotalRateio(rateioFormArrayValue);

  if (totalPercentual > 100 || totalQuantia > quantiaFormControlValue) {
    return { limiteRateio: true };
  }

  return null;
}
