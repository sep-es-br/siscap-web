export interface IEndereco {
  rua?: string;
  numero?: string;
  bairro?: string;
  complemento?: string;
  codigoPostal?: string;
  idCidade?: number;
  idEstado?: number;
  idPais?: number;
}

export interface IPessoa {
  readonly id: number;
  nome: string;
  nomeSocial: string;
  nacionalidade: string;
  genero: string;
  cpf: string;
  email: string;
  telefoneComercial: string;
  telefonePessoal: string;
  endereco: IEndereco;
  idOrganizacoes: Array<number>;
  idOrganizacaoResponsavel: number | null;
  idAreasAtuacao: Array<number>;
  imagemPerfil: ArrayBuffer | null;
}

export interface IPessoaForm extends Omit<IPessoa, 'id' | 'imagemPerfil'> {
  sub?: string;
}

export interface IPessoaTableData
  extends Pick<IPessoa, 'id' | 'nome' | 'email' | 'imagemPerfil'> {
  nomesOrganizacoes: Array<string>;
}

export interface IPessoaAcessoCidadao {
  sub: string;
  nome: string;
  apelido: string;
  email: string;
  subDescontinuado: string;
}
