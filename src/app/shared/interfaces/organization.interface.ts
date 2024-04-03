import { IHttpGetResponseBody } from './http-get.interface';

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
  idEntidadePai: number;
  idStatus: number;
  idPessoaResponsavel: number;
  idCidade: number;
  idEstado: number;
  idPais: number;
  idTipoEntidade: number;
}

export interface IOrganizationTable
  extends Pick<
    IOrganization,
    'id' | 'nome' | 'abreviatura' | 'telefone' | 'site' | 'imagemPerfil'
  > {
  nomeTipoEntidade: string;
}

export interface IOrganizationGet extends IHttpGetResponseBody<IOrganizationTable> {}

export interface IOrganizationCreate extends Omit<IOrganization, 'id' | 'idStatus'> {}

export interface IOrganizationEdit extends Partial<IOrganizationCreate> {}
