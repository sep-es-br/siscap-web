export enum PollingEtapas {
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

export enum PollingEtapasStatus {
  NAO_INICIADA = "NAO_INICIADA",
  EM_ANDAMENTO = "EM_ANDAMENTO",
  FINALIZADA = "FINALIZADA",
  ERRO_FASE = "ERRO_FASE",
}

export const getEtapasStatus = new Map<PollingEtapas, PollingEtapasStatus> ([
  [PollingEtapas.CAPTURA_ASSINATURA, PollingEtapasStatus.EM_ANDAMENTO],
  [PollingEtapas.AUTUAR, PollingEtapasStatus.FINALIZADA],
  [PollingEtapas.ENTRANHAR_ARQUIVO, PollingEtapasStatus.EM_ANDAMENTO],
  [PollingEtapas.DESPACHAR_PROCESSO, PollingEtapasStatus.EM_ANDAMENTO],
  [PollingEtapas.AVOCAR, PollingEtapasStatus.EM_ANDAMENTO],
  [PollingEtapas.DESENTRANHAR, PollingEtapasStatus.EM_ANDAMENTO],
  [PollingEtapas.CAPTURA_ASSINATURA_PENDENTE, PollingEtapasStatus.EM_ANDAMENTO],
  [PollingEtapas.ASSINADO, PollingEtapasStatus.FINALIZADA],
  [PollingEtapas.ERRO_FASE, PollingEtapasStatus.ERRO_FASE],
]);

export interface IPollingFases {
  readonly id: number;
  readonly etapa: PollingEtapas;
  readonly iniciada: boolean;
  readonly finalizada: boolean;
  readonly erro: boolean;
  readonly msgAlertaExibir: string;
  readonly contextoNegocio: string;
}

export interface IPollingFasesForm extends IPollingFases {
  descricao: string;
  status: PollingEtapasStatus;
}

export const pollingEtapasConfig: Array<{
  etapa: PollingEtapas;
  descricao: string;
}> = [
  { etapa: PollingEtapas.CAPTURA_ASSINATURA, descricao: 'Assinatura foi enviada com sucesso' },
  { etapa: PollingEtapas.AUTUAR, descricao: 'Não sei' },
  { etapa: PollingEtapas.ENTRANHAR_ARQUIVO, descricao: 'Não sei' },
  { etapa: PollingEtapas.DESPACHAR_PROCESSO, descricao: 'Não sei' },
  { etapa: PollingEtapas.AVOCAR, descricao: 'Não sei' },
  { etapa: PollingEtapas.DESENTRANHAR, descricao: 'Não sei' },
  { etapa: PollingEtapas.CAPTURA_ASSINATURA_PENDENTE, descricao: 'Assinatura está pendente' },
  { etapa: PollingEtapas.ASSINADO, descricao: 'Assinatura confirmada' },
  { etapa: PollingEtapas.ERRO_FASE, descricao: 'Ocorreu um erro' },
];

export const acharDescricaoEtapaPorEtapa = (etapa: PollingEtapas): string => {
  return pollingEtapasConfig.find((config) => config.etapa === etapa)?.descricao || '';
}