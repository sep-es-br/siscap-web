import { IUsuario, IUsuarioPerfil } from '../interfaces/usuario.interface';

export class UsuarioPerfilModel implements IUsuarioPerfil {
  public nome: string;
  public email: string;
  public subNovo: string;
  public imagemPerfil: ArrayBuffer | null;
  public permissoes: string[];
  public idOrganizacoes: number[];
  public idPessoa: number;
  public isProponente: boolean;
  public isSubcap: boolean;
  public isSubeo: boolean;
  public isSubepp: boolean;
  public nomeLotacaoUsuario: string;

  constructor(usuario?: IUsuario) {
    // console.log("usuario : ", usuario)
    this.nome = usuario?.nome ?? 'Usuario';
    this.email = usuario?.email ?? 'usuario@email.com';
    this.subNovo = usuario?.subNovo ?? '';
    this.imagemPerfil = usuario?.imagemPerfil ?? null;
    this.permissoes = usuario?.permissoes ?? [];
    this.idOrganizacoes = usuario?.idOrganizacoes ?? [];
    this.idPessoa = usuario?.idPessoa ?? 0;
    this.isProponente = usuario?.isProponente ?? false;
    this.isSubcap = usuario?.isSubcap ?? false;
    this.isSubeo = usuario?.isSubeo ?? false;
    this.isSubepp = usuario?.isSubepp ?? false;
    this.nomeLotacaoUsuario = usuario?.nomeLotacaoUsuario ?? '';
  }
}
