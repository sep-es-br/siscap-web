export interface IProjetoIntegracaoEdocsFases {
  readonly id: number;
  readonly etapa: string;
  readonly iniciada: boolean;
  readonly finalizada: boolean;
  readonly erro: boolean;
  readonly msgAlertaExibir: string;
  readonly contextoNegocio: string;
}
