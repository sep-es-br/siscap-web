export interface IOrganizacao {
  readonly id: number;
  readonly guid: string;
  readonly idStatus: number;
  nome: string;
  abreviatura: string;
  telefone: string;
  cnpj: string;
  fax: string;
  email: string;
  site: string;
  imagemPerfil: ArrayBuffer | null;
  idOrganizacaoPai: number;
  idPessoaResponsavel: number;
  idCidade: number;
  idEstado: number;
  idPais: number;
  idTipoOrganizacao: number;
}

export interface IOrganizacaoForm
  extends Omit<IOrganizacao, 'id' | 'guid' | 'idStatus' | 'imagemPerfil'> {}

export interface IOrganizacaoTableData
  extends Pick<
    IOrganizacao,
    'id' | 'nome' | 'telefone' | 'site' | 'imagemPerfil'
  > {
  nomeFantasia: string;
  nomeTipoOrganizacao: string;
}
