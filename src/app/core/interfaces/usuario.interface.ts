export interface IUsuario {
  token: string;
  nome: string;
  email: string;
  subNovo: string;
  imagemPerfil: ArrayBuffer | null;
  permissoes: Array<string>;
}

export interface IUsuarioPerfil extends Omit<IUsuario, 'token'> {}
