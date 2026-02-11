export interface IProjetoIntegracaoEdocsFases {
  readonly idProjeto: number;
  readonly etapa: string;
  readonly iniciada: boolean;
  readonly finalizada: boolean;
  readonly erro: boolean;
  readonly msgAlertaExibir: string;
}
