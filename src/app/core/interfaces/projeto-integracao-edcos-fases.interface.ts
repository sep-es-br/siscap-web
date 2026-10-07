export interface IProjetoIntegracaoEdocsFases {
  readonly id: number;
  readonly etapa: string;
  readonly iniciada: boolean;
  readonly finalizada: boolean;
  readonly erro: boolean;
  readonly tokenExpirado: boolean;
  readonly msgAlertaExibir: string;
  readonly contextoNegocio: string;
  readonly pdfConcluido?: boolean | null;
  readonly assinaturaConcluida?: boolean | null;
  readonly capturaConcluida?: boolean | null;
  readonly avisos?: string[];
  readonly encerramentoIniciado?: boolean | null;
  readonly encerramentoConcluido?: boolean | null;
  readonly erroEncerramento?: boolean | null;
}
