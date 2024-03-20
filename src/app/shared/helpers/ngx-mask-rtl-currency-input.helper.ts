import { InputTransformFn } from 'ngx-mask';

/**
 * @abstract
 * Classe abstrata que contém um método para alimentar a propriedade `inputTransformFn` da diretiva `NgxMaskDirective`.
 *
 * Foco em espécifico em um input do tipo `text` que recebe a referência de máscara `'separator.2'` do `NgxMask`.
 *
 */
export abstract class NgxMaskRtlCurrencyInputHelper {
  /**
   * @static
   * Método estático que recebe um input e o retorna de acordo com a lógica de formatação dentro do método.
   *
   * Utilizado para preencher o input da direita para a esquerda (Rtl = Right to Left), preenchendo primeiramente
   * os centavos, em seguida os inteiros.
   *
   * @param {unknown} value - Valor do input do campo.
   * @returns O valor formatado, do tipo `string` ou `number`
   */
  static RtlCurrencyInputTransformFn: InputTransformFn = (value) => {
    let untreatedValue;

    //`value` é do tipo unknown, convertemos aqui para utilizar métodos da API de String
    if (typeof value === 'number') {
      //Trata caso de valor pré-existente com menos de 3 dígitos inteiros e sem decimais
      untreatedValue = Number(value).toFixed(2);
    } else {
      untreatedValue = String(value);
    }

    //Remove o prefixo 'R$' do input quando houver
    let valueAsString = untreatedValue.includes('R$')
      ? untreatedValue.replace('R$', '')
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

    //Retorna o valor adicionando o prefixo 'R$' á frente
    return `R$${inputValue}`;
  };
}
