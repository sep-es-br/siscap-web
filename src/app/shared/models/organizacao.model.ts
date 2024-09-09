import {
  IOrganizacao,
  IOrganizacaoForm,
} from '../interfaces/organizacao.interface';

export class OrganizacaoFormModel implements IOrganizacaoForm {
  public nome: string;
  public abreviatura: string;
  public telefone: string;
  public cnpj: string;
  public fax: string;
  public email: string;
  public site: string;
  public idOrganizacaoPai: number;
  public idPessoaResponsavel: number;
  public idCidade: number;
  public idEstado: number;
  public idPais: number;
  public idTipoOrganizacao: number;

  constructor(organizacaoForm?: IOrganizacaoForm) {
    this.nome = organizacaoForm?.nome ?? '';
    this.abreviatura = organizacaoForm?.abreviatura ?? '';
    this.telefone = organizacaoForm?.telefone ?? '';
    this.cnpj = organizacaoForm?.cnpj ?? '';
    this.fax = organizacaoForm?.fax ?? '';
    this.email = organizacaoForm?.email ?? '';
    this.site = organizacaoForm?.site ?? '';
    this.idOrganizacaoPai = organizacaoForm?.idOrganizacaoPai ?? 0;
    this.idPessoaResponsavel = organizacaoForm?.idPessoaResponsavel ?? 0;
    this.idCidade = organizacaoForm?.idCidade ?? 0;
    this.idEstado = organizacaoForm?.idEstado ?? 0;
    this.idPais = organizacaoForm?.idPais ?? 0;
    this.idTipoOrganizacao = organizacaoForm?.idTipoOrganizacao ?? 0;
  }
}

export class OrganizacaoModel
  extends OrganizacaoFormModel
  implements IOrganizacao
{
  public readonly id: number;
  public readonly idStatus: number;
  public imagemPerfil: ArrayBuffer | null;

  constructor(organizacao?: IOrganizacao) {
    super(organizacao);
    this.id = organizacao?.id ?? 0;
	this.idStatus = organizacao?.idStatus ?? 0;
    this.imagemPerfil = organizacao?.imagemPerfil ?? null;
  }

  public converterArrayBufferEmImgSrc(): string {
    return this.imagemPerfil
      ? 'data:image/jpeg;base64,' + this.imagemPerfil
      : '';
  }
}
