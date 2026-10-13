import { ValidationErrors } from '@angular/forms';

import { RateioLocalidadeFormTypeValue } from '../types/form/rateio-form.type';

import { RateioCalculoHelper } from '../helpers/rateio-calculo.helper';

export function limiteRateioValidator(
  quantiaFormControlValue: number | null,
  rateioFormArrayValue: Array<RateioLocalidadeFormTypeValue>
): ValidationErrors | null {

  if (
    quantiaFormControlValue == null ||
    rateioFormArrayValue.length === 0
  ) {
    return null;
  }

  const [totalPercentual] =
    RateioCalculoHelper.calcularTotalRateio(rateioFormArrayValue);

  // Percentual com precisão de duas casas.
  const totalPercentualCentésimos =
    Math.round(totalPercentual * 100);

  // Somatório das quantias convertido individualmente para centavos.
  const totalQuantiaCentavos = rateioFormArrayValue.reduce(
    (total, rateio) =>
      total + Math.round(Number(rateio.quantia ?? 0) * 100),
    0
  );

  const valorEstimadoCentavos =
    Math.round(quantiaFormControlValue * 100);

  const percentualInvalido =
    (totalPercentualCentésimos > 0 &&
      totalPercentualCentésimos < 10000) ||
    totalPercentualCentésimos > 10000;

  const quantiaExcedida =
    totalQuantiaCentavos > valorEstimadoCentavos;

  if (percentualInvalido || quantiaExcedida) {
    return { limiteRateio: true };
  }

  return null;
  
}