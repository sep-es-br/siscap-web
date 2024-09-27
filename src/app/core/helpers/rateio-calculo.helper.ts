import { FormGroup } from '@angular/forms';

import {
  RateioCidadeFormType,
  RateioCidadeFormTypeValue,
  RateioMicrorregiaoFormType,
  RateioMicrorregiaoFormTypeValue,
} from '../types/form/rateio-form.type';

export abstract class RateioCalculoHelper {
  public static calcularPercentualPorQuantia(
    valorEstimado: number,
    quantia: number
  ): number {
    return (quantia * 100) / valorEstimado;
  }

  public static calcularQuantiaPorPercentual(
    valorEstimado: number,
    percentual: number
  ): number {
    return (valorEstimado * percentual) / 100;
  }

  public static calcularValoresMicrorregiaoPorCidades(
    rateioCidadeControlsArray: Array<FormGroup<RateioCidadeFormType>>
  ): [number, number] {
    return [
      this.somarValoresArray(
        this.mapearRateioCidadeControlsArrayPorPercentual(
          rateioCidadeControlsArray
        )
      ),
      this.somarValoresArray(
        this.mapearRateioCidadeControlsArrayPorQuantia(
          rateioCidadeControlsArray
        )
      ),
    ];
  }

  public static calcularValoresCidadesPorMicrorregiao(
    rateioMicrorregiaoControl: FormGroup<RateioMicrorregiaoFormType>,
    rateioCidadeControlsLength: number
  ): [number, number] {
    return [
      (rateioMicrorregiaoControl.controls.percentual.value ?? 0) /
        rateioCidadeControlsLength,
      (rateioMicrorregiaoControl.controls.quantia.value ?? 0) /
        rateioCidadeControlsLength,
    ];
  }

  public static calcularTotalRateio(
    rateioValuesArray:
      | Array<RateioMicrorregiaoFormTypeValue>
      | Array<RateioCidadeFormTypeValue>
  ): [number, number] {
    return [
      Math.round(
        this.somarValoresArray(
          this.mapearRateioValoresArrayPorPercentual(rateioValuesArray)
        )
      ),
      Math.round(
        this.somarValoresArray(
          this.mapearRateioValoresArrayPorQuantia(rateioValuesArray)
        )
      ),
    ];
  }

  private static mapearRateioCidadeControlsArrayPorPercentual(
    controlsArray: Array<FormGroup<RateioCidadeFormType>>
  ): Array<number> {
    return controlsArray.map(
      (control) => control.controls.percentual.value ?? 0
    );
  }

  private static mapearRateioValoresArrayPorPercentual(
    rateioValoresArray:
      | Array<RateioMicrorregiaoFormTypeValue>
      | Array<RateioCidadeFormTypeValue>
  ): Array<number> {
    return rateioValoresArray.map((rateio) => rateio.percentual ?? 0);
  }

  private static mapearRateioCidadeControlsArrayPorQuantia(
    controlsArray: Array<FormGroup<RateioCidadeFormType>>
  ): Array<number> {
    return controlsArray.map((control) => control.controls.quantia.value ?? 0);
  }

  private static mapearRateioValoresArrayPorQuantia(
    rateioValoresArray:
      | Array<RateioMicrorregiaoFormTypeValue>
      | Array<RateioCidadeFormTypeValue>
  ): Array<number> {
    return rateioValoresArray.map((rateio) => rateio.quantia ?? 0);
  }

  private static somarValoresArray(valoresArray: Array<number>): number {
    return valoresArray.reduce((prev, curr) => prev + curr, 0);
  }
}
