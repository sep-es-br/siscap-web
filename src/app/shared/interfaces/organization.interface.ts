export interface IOrganization {
  readonly id: number;
  nome: string;
  abreviatura: string;
  telefone: string;
  cnpj: string;
  fax: string;
  email: string;
  site: string;
  imagemPerfil: File | ArrayBuffer;
  idOrganizacaoPai: number;
  idStatus: number;
  idPessoaResponsavel: number;
  idCidade: number;
  idEstado: number;
  idPais: number;
  idTipoOrganizacao: number;
}

export interface IOrganizationTableData
  extends Pick<
    IOrganization,
    'id' | 'nome' | 'abreviatura' | 'telefone' | 'site' | 'imagemPerfil'
  > {
  nomeTipoOrganizacao: string;
}

export interface IOrganizationCreate extends Omit<IOrganization, 'id' | 'idStatus'> {}

export interface IOrganizationUpdate extends Partial<IOrganizationCreate> {}
