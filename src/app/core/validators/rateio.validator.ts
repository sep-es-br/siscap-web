import { ValidationErrors } from '@angular/forms';

import { RateioFormTypeValue } from '../types/form/rateio-form.type';

import { RateioCalculoHelper } from '../helpers/rateio-calculo.helper';

function rateioValidator_FormArrayVazio(
  rateioFormGroupValue: RateioFormTypeValue
): boolean {
  return (
    rateioFormGroupValue.rateioMicrorregiao?.length === 0 &&
    rateioFormGroupValue.rateioCidade?.length === 0
  );
}

function rateioValidator_CompararValores(
  valorA: number,
  valorB: number
): boolean {
  return valorA !== valorB;
}

function rateioValidator_ValoresIncompativeis(
  valorEstimadoCurrentValue: number | null,
  rateioFormGroupValue: RateioFormTypeValue
): boolean {
  if (
    !valorEstimadoCurrentValue ||
    !rateioFormGroupValue.rateioMicrorregiao ||
    !rateioFormGroupValue.rateioCidade
  ) {
    return false;
  }

  const totalRateioPorMicrorregioes = RateioCalculoHelper.calcularTotalRateio(
    rateioFormGroupValue.rateioMicrorregiao
  );

  const totalRateioPorCidades = RateioCalculoHelper.calcularTotalRateio(
    rateioFormGroupValue.rateioCidade
  );

  const percentualEntreRateios = rateioValidator_CompararValores(
    totalRateioPorMicrorregioes[0],
    totalRateioPorCidades[0]
  );

  const quantiaEntreRateios = rateioValidator_CompararValores(
    totalRateioPorMicrorregioes[1],
    totalRateioPorCidades[1]
  );

  const totalPercentualMicrorregioes = rateioValidator_CompararValores(
    totalRateioPorMicrorregioes[0],
    100
  );

  const totalPercentualCidades = rateioValidator_CompararValores(
    totalRateioPorCidades[0],
    100
  );

  const totalQuantiaMicrorregioes = rateioValidator_CompararValores(
    totalRateioPorMicrorregioes[1],
    valorEstimadoCurrentValue
  );

  const totalQuantiaCidades = rateioValidator_CompararValores(
    totalRateioPorCidades[1],
    valorEstimadoCurrentValue
  );

  const checkArray: Array<boolean> = [
    percentualEntreRateios,
    quantiaEntreRateios,
    totalPercentualMicrorregioes,
    totalPercentualCidades,
    totalQuantiaMicrorregioes,
    totalQuantiaCidades,
  ];

  return checkArray.some((booleanCheck) => booleanCheck === true);
}

export function rateioValidator(
  valorEstimadoCurrentValue: number | null,
  rateioFormGroupValue: RateioFormTypeValue
): ValidationErrors | null {
  let validationErrorsObj: Object = {};

  const formArrayVazio = rateioValidator_FormArrayVazio(rateioFormGroupValue);

  if (formArrayVazio) {
    Object.assign(validationErrorsObj, { rateioFormArrayVazio: true });
  }

  const valoresIncompativeis = rateioValidator_ValoresIncompativeis(
    valorEstimadoCurrentValue,
    rateioFormGroupValue
  );

  if (valoresIncompativeis) {
    Object.assign(validationErrorsObj, { rateioValoresIncompativeis: true });
  }

  return Object.keys(validationErrorsObj).length > 0
    ? validationErrorsObj
    : null;
}
