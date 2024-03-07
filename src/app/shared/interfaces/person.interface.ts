import { IHttpGetResponseBody } from './http-get.interface';

interface IEndereço {
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
  nomeSocial: string;
  nacionalidade: string;
  genero: string;
  cpf: string;
  email: string;
  endereco: IEndereço;
  imagemPerfil: string;
}

export interface IPersonTable extends Pick<IPerson, 'id' | 'nome' | 'email'> {
  nomeImagem: string;
}

export interface IPersonGet extends IHttpGetResponseBody<IPersonTable> {}

export interface IPersonCreate extends Omit<IPerson, 'id' | 'endereço.id'> {}

export interface IPersonEdit extends Partial<IPerson> {}
