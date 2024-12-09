import { RateioLocalidadeFormTypeValue } from '../types/form/rateio-form.type';

/**
 * @abstract
 * Classe abstrata para auxiliar nos cálculos do rateio.
 *
 * `03/10/2024` Atualmente contempla apenas a entidade Projeto.
 *
 * Glossário:
 * - `quantia`: Quantidade monetária em espécie(ex: R$ 100,00).
 * - `percentual`: Quantidade expressa em porcentagem (0% ~ 100%).
 * - `quantiaFormControlReferencia`: Quantidade monetária em espécie(ex: R$ 100,00).
 *    Proveniente de `RateioService`, que por sua vez recebe esse valor de um componente
 *    de formulário de uma entidade (ex: `Projeto -> projetoForm.valor`).
 */
export abstract class RateioCalculoHelper {
  /**
   * @public
   * @static
   * Método para calcular o valor percentual pela quantia baseado
   * na quantia do valor da entidade pertencente.
   *
   * Utilizado junto a um operador `Rxjs` `fromEvent`, onde se pesquisa um
   * elemento HTML no DOM e um evento desse elemento (ex: `input`) para que,
   * quando o usuário mudar o valor do controle, o outro valor possa ser alterado
   * sem a necessidade de chamar `subscribe` no `valueChanges` do controle.
   *
   * @param {number} quantiaFormControlReferencia - quantia do valor da entidade a qual o rateio pertence
   * @param {number} quantia - quantia de um controle do rateio
   * @returns {number} Valor da porcentagem do controle
   */
  public static calcularPercentualPorQuantia(
    quantiaFormControlReferencia: number,
    quantia: number
  ): number {
    return (quantia * 100) / quantiaFormControlReferencia;
  }

  /**
   * @public
   * @static
   * Método para calcular o valor quantia pelo percentual baseado
   * na quantia do valor da entidade pertencente.
   *
   * Utilizado junto a um operador `Rxjs` `fromEvent`, onde se pesquisa um
   * elemento HTML no DOM e um evento desse elemento (ex: `input`) para que,
   * quando o usuário mudar o valor do controle, o outro valor possa ser alterado
   * sem a necessidade de chamar `subscribe` no `valueChanges` do controle.
   *
   * @param {number} quantiaFormControlReferencia - quantia do valor da entidade a qual o rateio pertence
   * @param {number} percentual - percentual de um controle do rateio
   * @returns {number} Valor da quantia do controle
   */
  public static calcularQuantiaPorPercentual(
    quantiaFormControlReferencia: number,
    percentual: number
  ): number {
    return (quantiaFormControlReferencia * percentual) / 100;
  }

  /**
   * @public
   * @static
   * Método para calcular o total de valores percentual e quantia de um rateio.
   *
   * @param {Array<RateioLocalidadeFormTypeValue>} rateioFormArrayValue - `Array` de valores das localidades incluidas no rateio
   * @returns {[number, number]} Tupla (`Array` de dois elementos) do tipo `number`; O primeiro é o valor percentual e o segundo é o valor quantia
   */
  public static calcularTotalRateio(
    rateioFormArrayValue: Array<RateioLocalidadeFormTypeValue>
  ): [number, number] {
    return [
      this.somarValoresArray(
        this.mapearRateioValoresArrayPorPercentual(rateioFormArrayValue)
      ),
      this.somarValoresArray(
        this.mapearRateioValoresArrayPorQuantia(rateioFormArrayValue)
      ),
    ];
  }

  /**
   * @private
   * @static
   * Métodos auxiliar para mapear os valores dos controles do tipo percentual
   * das localidades incluidas no rateio.
   *
   * @param {Array<RateioLocalidadeFormTypeValue>} rateioFormArrayValue - `Array` de valores das localidades incluidas no rateio
   * @returns {Array<number>} `Array` contendo os valores percentuais
   */
  private static mapearRateioValoresArrayPorPercentual(
    rateioFormArrayValue: Array<RateioLocalidadeFormTypeValue>
  ): Array<number> {
    return rateioFormArrayValue.map((rateio) => rateio.percentual ?? 0);
  }

  /**
   * @private
   * @static
   * Métodos auxiliar para mapear os valores dos controles do tipo quantia
   * das localidades incluidas no rateio.
   *
   * @param {Array<RateioLocalidadeFormTypeValue>} rateioFormArrayValue - `Array` de valores das localidades incluidas no rateio
   * @returns {Array<number>} `Array` contendo os valores de quantias
   */
  private static mapearRateioValoresArrayPorQuantia(
    rateioFormArrayValue: Array<RateioLocalidadeFormTypeValue>
  ): Array<number> {
    return rateioFormArrayValue.map((rateio) => rateio.quantia ?? 0);
  }

  /**
   * @static
   * Método auxiliar para somar os elementos de um `Array` de `number`.
   *
   * Utilizado geralmente após mapear um `Array` do tipo
   * {@link RateioLocalidadeFormTypeValue} por percentual ou quantia.
   *
   * @param {Array<number>} valoresArray - `Array` dos valores a serem somados
   * @returns {number} O somatório dos valores, podendo ser `0` caso o `Array` esteja vazio
   */
  private static somarValoresArray(valoresArray: Array<number>): number {
    return valoresArray.reduce((prev, curr) => prev + curr, 0);
  }
}
