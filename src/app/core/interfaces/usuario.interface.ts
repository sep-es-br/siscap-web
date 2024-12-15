export interface IUsuario {
  token: string;
  nome: string;
  email: string;
  subNovo: string;
  imagemPerfil: ArrayBuffer | null;
  permissoes: Array<string>;
  idOrganizacoes: Array<number>;
  isProponente: boolean;
}

export interface IUsuarioPerfil extends Omit<IUsuario, 'token'> {}
