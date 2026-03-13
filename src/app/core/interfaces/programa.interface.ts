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
  protocoloEDocs?: string;
  sigla: string;
  statusPrograma: StatusPrograma;
  titulo: string;
  valor: IValor;
  valorCalculadoTotal: number;
  nomeagente: string;
}

export interface IProgramaForm extends Omit<IPrograma, 'id'> { }

export interface IProgramaTableData
  extends Pick<IPrograma, 'id' | 'sigla' | 'titulo' | 'protocoloEDocs' | 'statusPrograma'> {
  moeda: string;
  tetoPrograma: number;
}

export enum StatusPrograma {
  SEM_STATUS = -1,
  EDICAO = 1,
  AGUARDANDO_ASSINATURAS = 2,
  ASSINADO = 3,
  AUTUADO = 4,
  RECUSADO = 5,
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
  papelAssinante: string;
}

export interface IProgramaAssinaturasForm extends IPrograma {
  nomesOrgaosExecutores: Array<string>;
  listaDICSPropostos: Array<string>;
  assinaturaUsuarioAtual?: IProgramaAssinatura;
  demaisAssinaturas: Array<IProgramaAssinatura>;
}

export interface IProgramaOrgaosEnvolvidos {
  id: number;
  idPrograma: number;
  papel: PapelOrgaoPrograma;
}

export const StatusProgramaLabel: Record<StatusPrograma, string> = {
  [StatusPrograma.SEM_STATUS]: 'Sem Status',
  [StatusPrograma.EDICAO]: 'Edição',
  [StatusPrograma.AGUARDANDO_ASSINATURAS]: 'Aguardando Assinaturas',
  [StatusPrograma.ASSINADO]: 'Assinado',
  [StatusPrograma.AUTUADO]: 'Autuado',
  [StatusPrograma.RECUSADO]: 'Recusado',
};
