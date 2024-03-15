import { IHttpGetResponseBody } from './http-get.interface';

export interface IEntity {
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
  idPais: number;
  idTipoEntidade: number;
}

export interface IEntityTable
  extends Pick<
    IEntity,
    'id' | 'nome' | 'abreviatura' | 'telefone' | 'site' | 'imagemPerfil'
  > {
  nomeTipoEntidade: string;
}

export interface IEntityGet extends IHttpGetResponseBody<IEntityTable> {}

export interface IEntityCreate extends Omit<IEntity, 'id' | 'idStatus'> {}

export interface IEntityEdit extends Partial<IEntityCreate> {}
