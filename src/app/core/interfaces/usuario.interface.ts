export interface IUsuario {
  token: string;
  nome: string;
  email: string;
  subNovo: string;
  imagemPerfil: ArrayBuffer | null;
  permissoes: Array<string>;
  idOrganizacoes: Array<number>;
  idPessoa: number;
  isProponente: boolean;
  isSubcap: boolean;
  isSubeo: boolean;
  isSubepp: boolean;
  nomeLotacaoUsuario: string;
}

export interface IUsuarioPerfil extends Omit<IUsuario, 'token'> {}
