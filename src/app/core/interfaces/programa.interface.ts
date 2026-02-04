import { IEquipe } from './equipe.interface';
import { IValor } from './valor.interface';

export interface IPrograma {
  readonly id: number;
  sigla: string;
  titulo: string;
  idOrgaoExecutorList: Array<number>;
  equipeCaptacao: Array<IEquipe>;
  idProjetoPropostoList: Array<number>;
  valor: IValor;
  percentualCustoAdministrativo: number;
  valorCalculadoTotal: number;
  nomeagente: string;
  programaAssinantesEdocsDto?: Array<IProgramaAssinatura>;
  protocoloEDocs?: string;
}

export interface IProgramaForm extends Omit<IPrograma, 'id'> {}

export interface IProgramaTableData
  extends Pick<IPrograma, 'id' | 'sigla' | 'titulo'> {
  moeda: string;
  tetoPrograma: number;
}

export enum StatusAssinaturaPrograma {
  PENDENTE = 1,
  ASSINADO = 2,
  ERRO = 3,
}

export interface IProgramaAssinatura {
  id: number;
  idPrograma: number;
  idPessoa: number;
  nomeAssinante: string;
  statusAssinatura: StatusAssinaturaPrograma;
  dataAssinatura?: string;
  cargoPessoa: string;
}

export interface IProgramaAssinaturasForm extends IPrograma {
  nomesOrgaosExecutores: Array<string>;
  listaDICSPropostos: Array<string>;
  assinaturaUsuarioAtual?: IProgramaAssinatura;
  demaisAssinaturas: Array<IProgramaAssinatura>;
}