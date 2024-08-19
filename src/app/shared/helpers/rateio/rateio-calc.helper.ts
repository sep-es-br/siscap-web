/**
 * @abstract
 * Classe abstrata para auxiliar nos calculos do rateio.
 */
export abstract class RateioCalcHelper {
  public static calcularTotalRateio(
    rateioFormArrayValue: Array<any>,
    valorProjeto: number
  ): Array<number> {
    const totalRateioQuantia = this.somarValoresArray(
      this.mapearRateioFormArrayValue(rateioFormArrayValue)
    );

    const totalRateioPercentual = this.arrendondarDecimalPraBaixoDuasCasas(
      this.calcularPercentualPorQuantia(totalRateioQuantia, valorProjeto)
    );

    return [totalRateioPercentual, this.arrendondarDecimalPraBaixoDuasCasas(totalRateioQuantia)];
  }

  public static calcularPercentualPorQuantia(
    quantia: number,
    valorProjeto: number
  ): number {
    return (quantia * 100) / valorProjeto;
  }

  public static calcularValoresMicrorregiaoAutomatico(
    rateioFormArrayValue: Array<any>
  ): number {
    return this.arrendondarDecimalPraBaixoDuasCasas(
      this.somarValoresArray(
        this.mapearRateioFormArrayValue(rateioFormArrayValue)
      )
    );
  }

  public static calcularValoresCidadeAutomatico(
    rateioFormArrayValue: Array<any>,
    microrregiaoQuantiaRateio: number
  ): number {
    return this.arrendondarDecimalPraBaixoDuasCasas(
      microrregiaoQuantiaRateio / rateioFormArrayValue.length
    );
  }

  private static mapearRateioFormArrayValue(
    rateioFormArrayValue: Array<any>
  ): Array<number> {
    return rateioFormArrayValue.map((rateioCidade) => rateioCidade.quantia);
  }

  private static somarValoresArray(array: Array<number>): number {
    return array.reduce((prev, curr) => prev + curr, 0);
  }

  private static arrendondarDecimalPraBaixoDuasCasas(numero: number): number {
    const numero_toFixed3 = numero.toFixed(3);

    return parseFloat(numero_toFixed3.substring(0, numero_toFixed3.length - 1));
  }
}
