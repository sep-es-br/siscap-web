import { IHttpGetResponseBody } from './http-get.interface';

interface IAddress {
  readonly id: number;
  rua: string;
  numero: number;
  bairro: string;
  complemento: string;
  codigoPostal: string;
  idCidade: number;
}

export interface IPerson {
  readonly id: number;
  nome: string;
  nomeSocial?: string;
  nacionalidade: string;
  genero: string;
  cpf?: string;
  email: string;
  telefoneComercial?: string;
  telefonePessoal?: string;
  endereco?: IAddress;
  imagemPerfil?: ArrayBuffer | File; //ver isso aqui melhor
}

export interface IPersonTable extends Pick<IPerson, 'id' | 'nome' | 'email'> {
  imagemPerfil: ArrayBuffer;
}

export interface IPersonGet extends IHttpGetResponseBody<IPersonTable> {}

export interface IPersonCreate extends Omit<IPerson, 'id' | 'endereço.id'> {
  imagemPerfil?: File;
}

export interface IPersonEdit extends Partial<IPerson> {}
