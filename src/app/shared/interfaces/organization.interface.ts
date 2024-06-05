import { IHttpGetResponseBody } from './http-get.interface';

export interface IOrganization {
  readonly id: number;
  nome: string;
  nomeFantasia: string;
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

export interface IOrganizationTable
  extends Pick<
    IOrganization,
    'id' | 'nome' | 'nomeFantasia' | 'telefone' | 'site' | 'imagemPerfil'
  > {
  nomeTipoOrganizacao: string;
}

export interface IOrganizationGet extends IHttpGetResponseBody<IOrganizationTable> {}

export interface IOrganizationCreate extends Omit<IOrganization, 'id' | 'idStatus'> {}

export interface IOrganizationEdit extends Partial<IOrganizationCreate> {}
