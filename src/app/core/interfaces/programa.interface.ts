import { PapelOrgaoPrograma } from '../enums/orgaos.enum';
import { IEquipe } from './equipe.interface';
import { IValor } from './valor.interface';

export interface IPrograma {
  readonly id: number;
  equipeCaptacao: Array<IEquipe>;
  idProjetoPropostoList: Array<number>;
  orgaosEnvolvidosList: Array<IProgramaOrgaosEnvolvidos>;
  percentualCustoAdministrativo: number;
  programaAssinantesEdocsDto?: Array<IProgramaAssinatura>;
  protocoloEdocs?: string;
  sigla: string;
  statusPrograma: StatusPrograma;
  titulo: string;
  valor: IValor;
  valorCalculadoTotal: number;
  nomeagente: string;
  historicoStatus: Array<IProgramaStatus>;
}

export interface IProgramaForm extends Omit<IPrograma, 'id'> { }

export interface IProgramaTableData extends Pick<IPrograma, 'id' | 'sigla' | 'titulo' | 'protocoloEdocs' | 'statusPrograma'> {
  moeda: string;
  tetoPrograma: number;
}

export interface IProgramaFiltroPesquisa {
  status?: StatusPrograma;
  porTermo?: string;
}

export enum StatusPrograma {
  SEM_STATUS = -1,
  ELABORACAO = 1,
  AGUARDANDO_ASSINATURAS = 2,
  ASSINADO = 3,
  AUTUADO = 4,
  RECUSADO = 5,
}

export enum StatusAssinaturaPrograma {
  PENDENTE = 1,
  ASSINADO = 2,
  ERRO = 3,
  RECUSADO = 4,
}

export interface IProgramaAssinatura {
  id: number;
  idPrograma: number;
  idPessoa: number;
  nomeAssinante: string;
  statusAssinatura: StatusAssinaturaPrograma;
  dataAssinatura?: string;
  papelAssinante: string;
  textoAssinanteRecusa: string;
}

export interface IProgramaAssinaturasForm extends IPrograma {
  nomesOrgaosExecutores: Array<string>;
  listaDICSPropostos: Array<string>;
  assinaturaUsuarioAtual?: IProgramaAssinatura;
  demaisAssinaturas: Array<IProgramaAssinatura>;
}

export interface IProgramaStatus {
  id: number;
  status: StatusPrograma,
  idPessoa: number,
  nomePessoa: string,
  inicioEm: Date,
  fimEm: Date
}

export interface IProgramaOrgaosEnvolvidos {
  id: number;
  idPrograma: number;
  papel: PapelOrgaoPrograma;
}

export const StatusProgramaLabel: Record<StatusPrograma, string> = {
  [StatusPrograma.SEM_STATUS]: 'Status',
  [StatusPrograma.ELABORACAO]: 'Elaboração',
  [StatusPrograma.AGUARDANDO_ASSINATURAS]: 'Aguardando Assinaturas',
  [StatusPrograma.ASSINADO]: 'Assinado',
  [StatusPrograma.AUTUADO]: 'Autuado',
  [StatusPrograma.RECUSADO]: 'Recusado',
};
