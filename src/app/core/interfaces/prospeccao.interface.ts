import { ICartaConsultaDetalhes } from './carta-consulta.interface';

export interface IProspeccaoInteressado {
  idInteressado: number;
  emailInteressado: string;
}

export interface IProspeccaoOrganizacaoDetalhes {
  nomeFantasia: string;
  nome: string;
  cidade: string;
  estado: string;
  pais: string;
  telefone: string;
  email: string;
}

export interface IProspeccao {
  readonly id: number;
  idCartaConsulta: number;
  idOrganizacaoProspectora: number;
  idPessoaProspectora: number;
  idOrganizacaoProspectada: number;
  interessadosList: Array<IProspeccaoInteressado>;
}

export interface IProspeccaoForm extends Omit<IProspeccao, 'id'> {}

export interface IProspeccaoTableData extends Pick<IProspeccao, 'id'> {
  nomeOrganizacaoProspectada: string;
  tipoOperacao: string;
  objetoCartaConsulta: string;
  tipoProspeccao: string;
  statusProspeccao: string;
  dataProspeccao: string;
}

export interface IProspeccaoDetalhes extends Pick<IProspeccao, 'id'> {
  organizacaoProspectoraDetalhes: IProspeccaoOrganizacaoDetalhes;
  organizacaoProspectadaDetalhes: IProspeccaoOrganizacaoDetalhes;
  nomesInteressados: Array<string>;
  tipoOperacao: string;
  cartaConsultaDetalhes: ICartaConsultaDetalhes;
}
