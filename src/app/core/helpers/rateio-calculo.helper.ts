import { FormGroup } from '@angular/forms';
import { RateioLocalidadeFormTypeValue } from '../types/form/rateio-form.type';

// import {
//   RateioCidadeFormType,
//   RateioCidadeFormTypeValue,
//   RateioMicrorregiaoFormType,
//   RateioMicrorregiaoFormTypeValue,
// } from '../types/form/rateio-form.type';

// TERMINAR DOCUMENTACAO

/**
 * @abstract
 * Classe abstrata para auxiliar nos cálculos do rateio.
 *
 * `03/10/2024` Atualmente contempla apenas a entidade Projeto.
 *
 * Glossário:
 * - `quantia`: Quantidade monetária em espécie(ex: R$ 100,00).
 *    Atrelado á um dado do tipo `RateioMicrorregiao` ou `RateioCidade`.
 * - `percentual`: Quantidade expressa em porcentagem (0% ~ 100%).
 *    Atrelado á um dado do tipo `RateioMicrorregiao` ou `RateioCidade`.
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
   * Método para calcular os valores percentual e quantia que uma microrregião
   * irá receber, baseado no somatório dos valores percentual e quantia de cada
   * cidade inclusa no rateio, as quais estas cidades percentecem á microrregião.
   *
   * @param {Array<FormGroup<RateioCidadeFormType>>} rateioCidadeControlsArray - `Array` de `FormGroup`s contendo controles do tipo {@link RateioCidadeFormType}
   * @returns {[number, number]} Tupla (`Array` de dois elementos) do tipo `number`; O primeiro é o valor percentual e o segundo é o valor quantia
   */
  // public static calcularValoresMicrorregiaoPorCidades(
  //   rateioCidadeControlsArray: Array<FormGroup<RateioCidadeFormType>>
  // ): [number, number] {
  //   return [
  //     this.somarValoresArray(
  //       this.mapearRateioCidadeControlsArrayPorPercentual(
  //         rateioCidadeControlsArray
  //       )
  //     ),
  //     this.somarValoresArray(
  //       this.mapearRateioCidadeControlsArrayPorQuantia(
  //         rateioCidadeControlsArray
  //       )
  //     ),
  //   ];
  // }

  /**
   * @public
   * @static
   * Método para calcular os valores percentual e quantia que as cidades
   * inclusas no rateio pertencentes á uma microrregião irão receber, baseado
   * no valor percentual e quantia desta microrregião.
   *
   * @param {FormGroup<RateioMicrorregiaoFormType>} rateioMicrorregiaoControl - `FormGroup` contendo controles do tipo {@link RateioMicrorregiaoFormType}
   * @returns {[number, number]} Tupla (`Array` de dois elementos) do tipo `number`; O primeiro é o valor percentual e o segundo é o valor quantia
   */
  // public static calcularValoresCidadesPorMicrorregiao(
  //   rateioMicrorregiaoControl: FormGroup<RateioMicrorregiaoFormType>,
  //   rateioCidadeControlsLength: number
  // ): [number, number] {
  //   return [
  //     (rateioMicrorregiaoControl.controls.percentual.value ?? 0) /
  //       rateioCidadeControlsLength,
  //     (rateioMicrorregiaoControl.controls.quantia.value ?? 0) /
  //       rateioCidadeControlsLength,
  //   ];
  // }

  /**
   * @public
   * @static
   * Método para calcular o total de valores percentual e quantia de um rateio.
   *
   * @param {Array<RateioMicrorregiaoFormTypeValue> | Array<RateioCidadeFormTypeValue>} rateioValuesArray - `Array` de valores das cidades ou microrregiões.
   * @returns {[number, number]} Tupla (`Array` de dois elementos) do tipo `number`; O primeiro é o valor percentual e o segundo é o valor quantia
   */
  public static calcularTotalRateio(
    rateioFormArrayValue: Array<RateioLocalidadeFormTypeValue>
  ): [number, number] {
    return [
      Math.round(
        this.somarValoresArray(
          this.mapearRateioValoresArrayPorPercentual(rateioFormArrayValue)
        )
      ),
      Math.round(
        this.somarValoresArray(
          this.mapearRateioValoresArrayPorQuantia(rateioFormArrayValue)
        )
      ),
    ];
  }

  /**
   * @private
   * @static
   * Método auxiliar para mapear os controles de um
   * `Array` de `FormGroup`s de {@link RateioCidadeFormType}
   * pelo valor percentual.
   *
   * Utilizado expecificamente no método {@link calcularValoresMicrorregiaoPorCidades()}
   *
   * @param {Array<FormGroup<RateioCidadeFormType>>} controlsArray - `Array` de `FormGroup`s contendo controles do tipo {@link RateioCidadeFormType}
   * @returns {Array<number>} `Array` contendo os valores percentuais
   */
  // private static mapearRateioCidadeControlsArrayPorPercentual(
  //   controlsArray: Array<FormGroup<RateioCidadeFormType>>
  // ): Array<number> {
  //   return controlsArray.map(
  //     (control) => control.controls.percentual.value ?? 0
  //   );
  // }

  /**
   * @private
   * @static
   * Método auxiliar para mapear os **valores** dos controles de um
   * `Array` de `FormGroup`s de {@link RateioMicrorregiaoFormType}
   * ou {@link RateioCidadeFormType} pelo valor percentual.
   *
   * Utilizado especificamente no método {@link calcularTotalRateio()}
   *
   * ### Observação:
   * **valores** significa o valor dos controles do `FormArray`.
   * A tipagem utilizando {@link RateioMicrorregiaoFormTypeValue} e {@link RateioCidadeFormTypeValue}
   * garante ao desenvolvedor a facilidade de manipular os dados.
   *
   * @example
   * ```typescript
   *
   *    // tipo: Partial<{idMicrorregiao: number, percentual: number | null, quantia: number | null}>[]
   *    const rateioValoresArray = rateioMicrorregiaoFormArray.value
   *
   *    // Sem tipagem
   *    // tipo do argumento anônimo 'rateio' é 'any';
   *    // Acesso á propriedade por notação de ponto acusa erro.
   *    // Acesso á propriedade por indicie é permitida, mas pode causar erros em tempo de execução.
   *
   *    // ERRO
   *    return rateioValoresArray.map((rateio) => rateio.percentual);
   *
   *    // OK?
   *    return rateioValoresArray.map((rateio) => rateio['percentual']);
   *
   *    // Com tipagem
   *    // tipo do argumento anônimo 'rateio' é 'RateioMicrorregiaoFormTypeValue | RateioCidadeFormTypeValue';
   *    // Acesso á propriedade por notação de ponto ou indicie não acusa erro.
   *
   *    // OK
   *    return rateioValoresArray.map((rateio) => rateio.percentual);
   *
   *    // OK
   *    return rateioValoresArray.map((rateio) => rateio['percentual']);
   * ```
   *
   * @param {Array<RateioMicrorregiaoFormTypeValue> | Array<RateioCidadeFormTypeValue>} rateioValoresArray - `Array` de **valores** das cidades ou microrregiões.
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
   * Método auxiliar para mapear os controles de um
   * `Array` de `FormGroup`s de {@link RateioCidadeFormType}
   * pelo valor quantia.
   *
   * Utilizado expecificamente no método {@link calcularValoresMicrorregiaoPorCidades()}
   *
   * @param {Array<FormGroup<RateioCidadeFormType>>} controlsArray - `Array` de `FormGroup`s contendo controles do tipo {@link RateioCidadeFormType}
   * @returns {Array<number>} `Array` contendo os valores de quantias
   */
  // private static mapearRateioCidadeControlsArrayPorQuantia(
  //   controlsArray: Array<FormGroup<RateioCidadeFormType>>
  // ): Array<number> {
  //   return controlsArray.map((control) => control.controls.quantia.value ?? 0);
  // }

  /**
   * @private
   * @static
   * Método auxiliar para mapear os **valores** dos controles de um
   * `Array` de `FormGroup`s de {@link RateioMicrorregiaoFormType}
   * ou {@link RateioCidadeFormType} pelo valor quantia.
   *
   * Utilizado especificamente no método {@link calcularTotalRateio()}
   *
   * ### Observação:
   * **valores** significa o valor dos controles do `FormArray`.
   * A tipagem utilizando {@link RateioMicrorregiaoFormTypeValue} e {@link RateioCidadeFormTypeValue}
   * garante ao desenvolvedor a facilidade de manipular os dados.
   *
   * @example
   * ```typescript
   *
   *    // tipo: Partial<{idMicrorregiao: number, percentual: number | null, quantia: number | null}>[]
   *    const rateioValoresArray = rateioMicrorregiaoFormArray.value
   *
   *    // Sem tipagem
   *    // tipo do argumento anônimo 'rateio' é 'any';
   *    // Acesso á propriedade por notação de ponto acusa erro.
   *    // Acesso á propriedade por indicie é permitida, mas pode causar erros em tempo de execução.
   *
   *    // ERRO
   *    return rateioValoresArray.map((rateio) => rateio.percentual);
   *
   *    // OK?
   *    return rateioValoresArray.map((rateio) => rateio['percentual']);
   *
   *    // Com tipagem
   *    // tipo do argumento anônimo 'rateio' é 'RateioMicrorregiaoFormTypeValue | RateioCidadeFormTypeValue';
   *    // Acesso á propriedade por notação de ponto ou indicie não acusa erro.
   *
   *    // OK
   *    return rateioValoresArray.map((rateio) => rateio.percentual);
   *
   *    // OK
   *    return rateioValoresArray.map((rateio) => rateio['percentual']);
   * ```
   *
   * @param {Array<RateioMicrorregiaoFormTypeValue> | Array<RateioCidadeFormTypeValue>} rateioValoresArray - `Array` de **valores** das cidades ou microrregiões.
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
   * Utilizado geralmente após mapear um `Array` de
   * {@link RateioMicrorregiaoFormType} ou {@link RateioCidadeFormType}
   * por percentual ou quantia.
   *
   * @param {Array<number>} valoresArray - `Array` dos valores a serem somados
   * @returns {number} O somatório dos valores, podendo ser `0` caso o `Array` esteja vazio
   */
  private static somarValoresArray(valoresArray: Array<number>): number {
    return valoresArray.reduce((prev, curr) => prev + curr, 0);
  }
}
