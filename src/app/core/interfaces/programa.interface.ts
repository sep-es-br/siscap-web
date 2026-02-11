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
  papelAssinante: string;
}

export interface IProgramaAssinaturasForm extends IPrograma {
  nomesOrgaosExecutores: Array<string>;
  listaDICSPropostos: Array<string>;
  assinaturaUsuarioAtual?: IProgramaAssinatura;
  demaisAssinaturas: Array<IProgramaAssinatura>;
}

export enum ProgramaAssinaturasEtapas {
  CAPTURA_ASSINATURA = 'CAPTURAASSINA',
  AUTUAR = 'AUTUAR',
  ENTRANHAR_ARQUIVO = 'ENTRANHARARQUIVO',
  DESPACHAR_PROCESSO = 'DESPACHARPROCESSO',
  AVOCAR = 'AVOCAR',
  DESENTRANHAR = 'DESENTRANHAR',
  CAPTURA_ASSINATURA_PENDENTE = 'CAPTURAASSINAPENDENTE',
  ASSINADO = 'ASSINADO',
  ERRO_FASE = 'ERROFASE',
}

export enum ProgramaAssinaturasStatus {
  NAO_INICIADA = "NAO_INICIADA",
  EM_ANDAMENTO = "EM_ANDAMENTO",
  FINALIZADA = "FINALIZADA",
  ERRO_FASE = "ERRO_FASE",
}

export const getEtapaStatus = new Map<ProgramaAssinaturasEtapas, ProgramaAssinaturasStatus> ([
  [ProgramaAssinaturasEtapas.CAPTURA_ASSINATURA, ProgramaAssinaturasStatus.EM_ANDAMENTO],
  [ProgramaAssinaturasEtapas.AUTUAR, ProgramaAssinaturasStatus.FINALIZADA],
  [ProgramaAssinaturasEtapas.ENTRANHAR_ARQUIVO, ProgramaAssinaturasStatus.EM_ANDAMENTO],
  [ProgramaAssinaturasEtapas.DESPACHAR_PROCESSO, ProgramaAssinaturasStatus.EM_ANDAMENTO],
  [ProgramaAssinaturasEtapas.AVOCAR, ProgramaAssinaturasStatus.EM_ANDAMENTO],
  [ProgramaAssinaturasEtapas.DESENTRANHAR, ProgramaAssinaturasStatus.EM_ANDAMENTO],
  [ProgramaAssinaturasEtapas.CAPTURA_ASSINATURA_PENDENTE, ProgramaAssinaturasStatus.NAO_INICIADA],
  [ProgramaAssinaturasEtapas.ASSINADO, ProgramaAssinaturasStatus.FINALIZADA],
  [ProgramaAssinaturasEtapas.ERRO_FASE, ProgramaAssinaturasStatus.ERRO_FASE],
]);

export interface IProgramaAssinaturaFases {
  readonly id: number;
  readonly etapa: ProgramaAssinaturasEtapas;
  readonly iniciada: boolean;
  readonly finalizada: boolean;
  readonly erro: boolean;
  readonly msgAlertaExibir: string;
  readonly contextoNegocio: string;
}

export interface IProgramaAssinaturaFasesForm extends IProgramaAssinaturaFases {
  descricao: string;
  status: ProgramaAssinaturasStatus;
}

export const programaAssinaturasConfig: Array<{
  etapa: ProgramaAssinaturasEtapas;
  descricao: string;
}> = [
  { etapa: ProgramaAssinaturasEtapas.CAPTURA_ASSINATURA, descricao: 'Assinatura foi enviada com sucesso' },
  { etapa: ProgramaAssinaturasEtapas.AUTUAR, descricao: 'Não sei' },
  { etapa: ProgramaAssinaturasEtapas.ENTRANHAR_ARQUIVO, descricao: 'Não sei' },
  { etapa: ProgramaAssinaturasEtapas.DESPACHAR_PROCESSO, descricao: 'Não sei' },
  { etapa: ProgramaAssinaturasEtapas.AVOCAR, descricao: 'Não sei' },
  { etapa: ProgramaAssinaturasEtapas.DESENTRANHAR, descricao: 'Não sei' },
  { etapa: ProgramaAssinaturasEtapas.CAPTURA_ASSINATURA_PENDENTE, descricao: 'Assinatura está pendente' },
  { etapa: ProgramaAssinaturasEtapas.ASSINADO, descricao: 'Assinatura confirmada' },
  { etapa: ProgramaAssinaturasEtapas.ERRO_FASE, descricao: 'Ocorreu um erro' },
];

export const acharDescricaoEtapaPorEtapaAssinatura = (etapa: ProgramaAssinaturasEtapas): string => {
  return programaAssinaturasConfig.find((config) => config.etapa === etapa)?.descricao || '';
}