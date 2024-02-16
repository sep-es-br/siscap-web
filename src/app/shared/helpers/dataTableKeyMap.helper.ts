/**
 * @abstract
 * Classe abstrata auxiliar para mapear as chaves do objeto fonte e retornar
 * uma `string` com formatação adequada, tendo em vista limitações de
 * caracteres, símbolos especiais, etc.
 */
abstract class ObjectKeyMap {
  /**
   * @static
   * Método estático que retorna a chave do objeto fonte formatada.
   * Foco específico no objeto Projetos `IProjectCreateInterface`
   *
   * @param {string} objectKey Chave do objeto fonte.
   *
   * @returns {string} A chave do objeto formatada.
   */
  static projectKeyMap(objectKey: string): string {
    let projectKey = '';
    switch (objectKey) {
      case 'sigla':
        projectKey = 'Sigla';
        break;
      case 'titulo':
        projectKey = 'Titulo';
        break;
      case 'valorEstimado':
        projectKey = 'Valor';
        break;
      case 'objetivo':
        projectKey = 'Objetivo';
        break;
      case 'objetivoEspecifico':
        projectKey = 'Obj. Esp.';
        break;
      case 'idStatus':
        projectKey = 'Status';
        break;
      case 'idEntidade':
        projectKey = 'Orgão';
        break;
      case 'situacaoProblema':
        projectKey = 'Situação';
        break;
      case 'solucoesPropostas':
        projectKey = 'Soluções';
        break;
      case 'impactos':
        projectKey = 'Impactos';
        break;
      case 'arranjosInstitucionais':
        projectKey = 'Arranjos';
        break;
      case 'idMicroregioes': //NOTA: retorno do GET/projetos contém ``` idMicro[R]egioes ``` com um 'r' só.
        projectKey = 'Microrreg.';
        break;
      default:
        break;
    }
    return projectKey;
  }

  // Exemplo de keyMap de outros objetos:

  /**
   * @todo
   * PLACEHOLDER (Método não implementado)
   */
  static programsKeyMap(key: string): void {
    // Replicar lógica para objeto 'Programas' -> Ainda não criado
  }
}

/**
 * @abstract
 * @extends ObjectKeyMap
 *
 * Classe abstrata com método estático para retornar uma lista que serve de
 * alimentação para a propriedade `dataTableColumns` do componente `ngx-datatable`
 *
 * {@link https://github.com/swimlane/ngx-datatable | ngx-datatable no GitHub}
 *
 */
export abstract class DataTableKeyMap extends ObjectKeyMap {
  /**
   * @static
   * Método estático que cria um array de alimentação para um componente
   * `ngx-datatable`.
   *
   * @param {string} scope - Escopo do componente de origem. Forneça como a propriedade `[source]` dentro
   * do componente pai de `app-data-table`. Utilizado para chamar o método estático apropriado da classe
   * `ObjectKeyMap`.
   *
   * @example
   *
   * ```html
   * <app-data-table [source]='projetos'></app-data-table>
   * ```
   *
   * @param {Object} object - Objeto fonte do componente pai. Apenas as chaves são utilizadas.
   * 
   * @returns {Array}  Um array de objetos do tipo `{name: string, prop: string}`
   */
  static DataTableColumnsArrayKeyMap(
    scope: string,
    object: Object
  ): Array<{ name: string; prop: string }> {
    let keyMapArray: Array<{ name: string; prop: string }> = [];
    for (const key in object) {
      if (Object.prototype.hasOwnProperty.call(object, key)) {
        if (key !== 'id') {
          switch (scope) {
            case 'projetos':
              keyMapArray.push({
                name: ObjectKeyMap.projectKeyMap(key),
                prop: key,
              });
              break;

            default:
              break;
          }
        }
      }
    }
    return keyMapArray;
  }
}
