import { IUsuario, IUsuarioPerfil } from '../interfaces/usuario.interface';

export class UsuarioPerfilModel implements IUsuarioPerfil {
  public nome: string;
  public email: string;
  public subNovo: string;
  public imagemPerfil: ArrayBuffer | null;
  public permissoes: string[];

  constructor(usuario?: IUsuario) {
    this.nome = usuario?.nome ?? 'Usuario';
    this.email = usuario?.email ?? 'usuario@email.com';
    this.subNovo = usuario?.subNovo ?? '';
    this.imagemPerfil = usuario?.imagemPerfil ?? null;
    this.permissoes = usuario?.permissoes ?? [];
  }
}
