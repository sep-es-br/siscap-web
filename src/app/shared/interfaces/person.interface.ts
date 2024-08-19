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
  idOrganizacoes: Array<number>,
  idOrganizacaoResponsavel: number | null,
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

export interface IPersonTableData extends Pick<IPerson, 'id' | 'nome' | 'email' | 'imagemPerfil'> {
  nomesOrganizacoes: Array<string>;
}

export interface IPersonCreate extends Omit<IPerson, 'id' | 'endereço.id'> {}

export interface IPersonUpdate extends Partial<IPersonCreate> {}
