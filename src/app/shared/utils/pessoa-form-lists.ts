/**
 * Utilizado para alimentar as listas do select apropriado do componente de pessoas
 */
export abstract class PessoaFormLists {
  static nacionalidadesList: Array<string> = ['Brasileira'];

  static generosList: Array<string> = [
    'Masculino',
    'Feminino',
    'Outro',
  ];
}
