import { InputTransformFn, OutputTransformFn } from 'ngx-mask';

/**
 * @abstract
 * Classe abstrata que contém métodos para alimentar as propriedades `inputTransformFn` e/ou `outputTransformFn` da diretiva `NgxMaskDirective`.
 *
 */
export abstract class NgxMaskTransformFunctionHelper {
  /**
   * @static
   * Método estático que recebe um input e o retorna de acordo com a lógica de formatação dentro do método.
   *
   * Utilizado para preencher o input da direita para a esquerda (Rtl = Right to Left), preenchendo primeiramente
   * os centavos, em seguida os inteiros.
   *
   * @param {unknown} value - Valor do input do campo.
   * @returns O valor formatado do tipo `string`.
   */
  public static readonly rtlCurrencyInputTransformFn: InputTransformFn = (
    value: unknown
  ): string => {
    //`value` é do tipo unknown, convertemos aqui para utilizar métodos da API de String
    //Trata caso de valor pré-existente com menos de 3 dígitos inteiros e sem decimais; Se não, fluxo normal
    let untreatedValue =
      typeof value === 'number' ? Number(value).toFixed(2) : String(value);

    //Checa a existência do prefixo de moeda (ex: 'R$') do input
    const currencySymbol = untreatedValue.match(new RegExp(/[^\d.,]+/g));

    //Remove o prefixo de moeda do input quando houver
    let valueAsString = !!currencySymbol
      ? untreatedValue.replace(currencySymbol[0], '')
      : untreatedValue;

    //Substitui o ponto por vírgula ao carregar o formulário pela primeira vez quando modo de edição/detalhes
    valueAsString =
      valueAsString.includes('.') && !valueAsString.includes(',')
        ? valueAsString.replace('.', ',')
        : valueAsString;

    //Caso o usuário delete completamente o input (Ctrl + Backspace) ou remova inputs até o valor ser 0, retornamos uma string vazia
    if (!valueAsString || valueAsString == '0,0') {
      return '';
    }

    //Consulta `valueAsString` verificando a existência de caracteres que não sejam dígitos (0~9) ou vírgula (,)
    const forbiddenValues = valueAsString.match(/[^\d\,]/g);

    //Caso haja caracteres proibidos, removemos estes de `valueAsString`
    if (forbiddenValues !== null) {
      valueAsString = valueAsString.replace(forbiddenValues[0], '');
    }

    //Valor á ser manipulado, á fim de não mexermos diretamente no input do campo
    let inputValue = 'A,BC';

    //Separamos `valueAsString` entre inteiros (caracteres antes da vírgula) e decimais (caracteres depois da vírgula)
    let [integers, decimals] = valueAsString.split(',');

    if (!!decimals) {
      //Caso do valor do input possuir valores decimais

      switch (decimals.length) {
        //Caso do usuário acrescentar valores ao input (digitação)
        case 3:
          const lastTwoDecimals = decimals.substring(1, decimals.length);
          const firstDecimal = decimals[0];

          decimals = lastTwoDecimals;
          integers =
            integers == '0' ? firstDecimal : integers.concat(firstDecimal);
          break;

        //Caso do usuário navegar para página de edição/deleção (não houve mudança no input, mas valor é pré-preenchido)
        case 2:
          break;

        //Caso do usuário remover valores do input (backspace); Equivalente á decimals.length == 1
        default:
          const lastInteger = integers[integers.length - 1];
          const integersRest = integers.substring(0, integers.length - 1);

          decimals = lastInteger + decimals;
          integers = integersRest == '' ? '0' : integersRest;
          break;
      }

      //Reescreve inputValue com os valores
      inputValue = inputValue.replace('C', decimals[decimals.length - 1]);
      inputValue = inputValue.replace('B', decimals[decimals.length - 2]);
      inputValue = inputValue.replace('A', integers);
    } else {
      //Caso do valor do input não possuir valores decimais (Valor prévio do input é null)

      //Reescreve inputValue com os valores
      inputValue = inputValue.replace('C', integers);
      inputValue = inputValue.replace('B', '0');
      inputValue = inputValue.replace('A', '0');
    }

    //Monta o valor de retorno do método, utilizando prefixo de Real Brasileiro ('R$') como padrão
    const returnValue = !!currencySymbol
      ? `${currencySymbol[0]}${inputValue}`
      : 'R$' + inputValue;

    return returnValue;
  };

  /**
   *
   * @static
   * Método estático para alimentar o valor do `FormControl` pertinente com o valor recebido de uma `inputTransformFn`.
   * Nesse caso em específico, a função estática `rtlCurrencyInputTransformFn`.
   *
   * @param {string | number | undefined | null} value - O valor recebido da função `inputTransformFn` do mesmo campo.
   * @returns O valor formatado do tipo `number` ou `null`.
   */
  public static readonly rtlCurrencyOutputTransformFn: OutputTransformFn = (
    value: string | number | undefined | null
  ): number | null => {
    return !!value ? Number(value) : null;
  };

  /**
   * @static
   * Método estático que transforma todo o input em letras maiúsculas (uppercase)
   *
   * @param {unknown} value - O valor de input do campo.
   * @returns O valor formatado do tipo `string`.
   */
  public static readonly toUppercaseInputTransformFn: InputTransformFn = (
    value: unknown
  ): string => {
    return typeof value === 'string' ? value.toUpperCase() : String(value);
  };

  /**
   * @static
   * Método estático para alimentar o valor do `FormControl` pertinente com o valor recebido de uma `inputTransformFn`.
   * Nesse caso em específico, a função estática `toUppercaseInputTransformFn`.
   *
   * @param {string | number | undefined | null} value - O valor recebido da função `inputTransformFn` do mesmo campo.
   * @returns O valor formatado do tipo `string`.
   */
  public static readonly toUppercaseOutputTransformFn: OutputTransformFn = (
    value: string | number | undefined | null
  ): string => {
    return value ? String(value).toUpperCase() : '';
  };

  /**
   * @static
   * Método estático que formata o input de porcentagem para o formato 'XX,XX%'
   *
   * @param {unknown} value - O valor de input do campo.
   * @returns O valor formatado do tipo `string`.
   */
  public static readonly percentInputTransformFn: InputTransformFn = (
    value: unknown
  ): string => {
    let untreatedValue =
      typeof value === 'number' ? Number(value).toFixed(2) : String(value);

    return untreatedValue.includes('.')
      ? untreatedValue.replace('.', ',')
      : untreatedValue;
  };

  /**
   *
   * @static
   * Método estático para alimentar o valor do `FormControl` pertinente com o valor recebido de uma `inputTransformFn`.
   * Nesse caso em específico, a função estática `percentInputTransformFn`.
   *
   * @param {string | number | undefined | null} value - O valor recebido da função `inputTransformFn` do mesmo campo.
   * @returns O valor formatado do tipo `number` ou `null`.
   */
  public static readonly percentOutputTransformFn: OutputTransformFn = (
    value: string | number | undefined | null
  ): number | null => {
    return !!value ? Number(value) : null;
  };
}
