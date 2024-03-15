/**
 * Classe abstrata com um método para criar um `FormData` a partir do valor de um formulario,
 * com o propósito de possibilitar o anexo de arquivos (primariamente imagens) junto ao corpo da requisição
 * (`POST` ou `PUT`).
 */
export abstract class FormDataHelper {
  /**
   * Método estático que anexa á um `FormData` os pares chave-valor do valor de um formulário.
   * 
   * Atualmente contempla apenas um nível de estratificação do formulário.
   * 
   * @example
   * ```ts
   * formValue = {
   *  prop1: 'valor1',
   *  prop2: 1,
   *  .
   *  .
   *  .
   *  propN: {
   *    propN1: 'valorA',
   *    propN2: 2
   *  },
   * }
   * 
   * ``` 
   * 
   * @param {any} formValue - O valor do formulário.
   * @param {string[]} nestedGroups - Parâmetro rest (opcional) contendo chaves do valor do formulário cujos valores são objetos (chaves aninhadas).
   * @returns `FormData` contendo os valores do formulário original.
   */
  static appendFormGrouptoFormData(
    formValue: any,
    ...nestedGroups: string[]
  ): FormData {
    const formData = new FormData();

    nestedGroups.forEach((nestGroup) => {
      for (let nestGroupKey in formValue[nestGroup]) {
        if (!!formValue[nestGroup][nestGroupKey]) {
          formData.append(
            `${nestGroup}.${nestGroupKey}`,
            formValue[nestGroup][nestGroupKey]
          );
        }
      }
    });

    for (const key in formValue) {
      const typedKey = key as keyof typeof formValue;

      if (!!formValue[typedKey] && !nestedGroups.includes(key)) {
        formData.append(key, formValue[typedKey]);
      }
    }

    return formData;
  }
}
