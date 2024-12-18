import { AbstractControl } from '@angular/forms';

import { MoedaHelper } from '../helpers/moeda.helper';

/**
 * Arquivo contendo funções de utilidade reutilizadas em toda a aplicação.
 */

/**
 * @function
 * Converte `ArrayBuffer` em `string` contendo a imagem em formato `base64`.
 * Utilizado para alimentar propriedade `src` de tags HTML `<img>`,
 * a fim de exibir imagens de perfil de usuário, imagem de uma `Pessoa`
 * ou de uma `Organizacao`.
 *
 * @param {ArrayBuffer} imgArrayBuffer - `ArrayBuffer` contendo a imagem
 * @returns {string} `string` em `base64`
 */
export function converterArrayBufferEmImgSrc(
  imgArrayBuffer: ArrayBuffer | null
): string {
  return imgArrayBuffer ? 'data:image/jpeg;base64,' + imgArrayBuffer : '';
}

/**
 * @function
 * Habilita ou desabilita programaticamente os controles de um formulário.
 * Utilizado em formulários de edição para evitar que usuários sem permissionamento
 * alterem valores.
 * Também altera valor do controle para `null` caso esteja vazio.
 *
 * @param {boolean} permitir - `true` para habilitar, `false` para desabilitar
 * @param {Object} controles - Objeto de controles do formulário
 */
export function alterarEstadoControlesFormulario(
  permitir: boolean,
  controles: { [key: string]: AbstractControl<any, any> }
): void {
  for (const key in controles) {
    const controle = controles[key];
    permitir ? controle.enable() : controle.disable();
    if (!controle.value) controle.patchValue(null);
  }
}

/**
 * @function
 * Retorna o símbolo da moeda de acordo com o código da moeda.
 * 
 * Utilizado em componentes de listagem ou controles de formulário
 * (geralmente do tipo `<input type="text">`); Normalmente o campo
 * vem acompanhado de ou uma diretiva `NgxMaskDirective` ou um pipe
 * `NgxMaskPipe`. O propósito deste método é centralizar a comunicação
 * entre a lógica (arquivo `.ts`) e a apresentação (arquivo `.html`).
 * 
 * @param {string | undefined | null} moeda - código da moeda (ex: 'BRL')
 * @returns {string} O símbolo da moeda (ex: 'R$')
 */
export function getSimboloMoeda(moeda: string | undefined | null): string {
  if (!moeda) {
    return 'R$';
  }

  return MoedaHelper.getSimbolo(moeda);
}
