import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { RateioCalcHelper } from './rateio-calc.helper';

export function rateioValidatorFn(
  valorEstimadoControl: AbstractControl<number | null, number | null> | null
): ValidatorFn {
  return (control: AbstractControl<any, any>): ValidationErrors | null => {
    const valorEstimadoCurrentValue: number = valorEstimadoControl?.value ?? 0;

    const totalRateioQuantia = RateioCalcHelper.calcularTotalRateio(
      control.value,
      valorEstimadoCurrentValue
    )[1];

    if (totalRateioQuantia > valorEstimadoCurrentValue) {
      return { limiteRateio: true };
    }

    return null;
  };
}
