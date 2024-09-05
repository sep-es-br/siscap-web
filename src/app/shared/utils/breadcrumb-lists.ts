/**
 * Utilizado para alimentar as propriedades do componente de breadcrumb
 */
export abstract class BreadcrumbLists {
  static exclusionList: Array<string> = ['', 'home', 'form'];

  static mainChildPaths: Array<string> = ['projetos', 'programas', 'pessoas', 'organizacoes'];
}
