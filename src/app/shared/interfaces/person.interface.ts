import { IHttpGetResponseBody } from './http-get.interface';

interface IAddress {
  readonly id: number;
  rua?: string;
  numero?: number;
  bairro?: string;
  complemento?: string;
  codigoPostal?: string;
  idCidade?: number;
  idEstado?: number;
  idPais?: number;
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
  idOrganizacao: number,
  idAreasAtuacao: Array<string>;
  imagemPerfil?: File | ArrayBuffer;
}

export interface IPersonACApi {
  sub: string;
  nome: string;
  apelido: string;
  email: string;
  subDescontinuado: string;
}

export interface IPersonTable extends Pick<IPerson, 'id' | 'nome' | 'email' | 'imagemPerfil'> {}

export interface IPersonGet extends IHttpGetResponseBody<IPersonTable> {}

export interface IPersonCreate extends Omit<IPerson, 'id' | 'endereço.id'> {}

export interface IPersonEdit extends Partial<IPersonCreate> {}
