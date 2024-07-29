export interface IProfile {
    token: string;
    nome: string;
    email: string;
    subNovo: string;
    imagemPerfil?: ArrayBuffer;
    permissoes: Array<string>;
}

export enum PermissionsMap {
  projetoscriar = 'PROJETO_CADASTRAR',
  projetoseditar = 'PROJETO_ATUALIZAR',

  pessoascriar = 'PESSOA_CADASTRAR',
  pessoaseditar = 'PESSOA_ATUALIZAR',

  organizacoescriar = 'ORGANIZACAO_CADASTRAR',
  organizacoeseditar = 'ORGANIZACAO_ATUALIZAR',

  adminAuth = "ADMIN_AUTH",
}
