import { IPollingFases, PollingEtapas } from "../interfaces/polling.interface";

export class PollingFasesModel implements IPollingFases {
  public id: number;
  public etapa: PollingEtapas;
  public iniciada: boolean;
  public finalizada: boolean;
  public erro: boolean;
  public msgAlertaExibir: string;
  public contextoNegocio: string;

  constructor(fase?: IPollingFases) {
    this.id = (fase && fase.id) ?? 0;
    this.etapa = (fase && fase.etapa) ?? PollingEtapas.CAPTURA_ASSINATURA_PENDENTE;
    this.iniciada = (fase && fase.iniciada) ?? false;
    this.finalizada = (fase && fase.finalizada) ?? false;
    this.erro = (fase && fase.erro) ?? false;
    this.msgAlertaExibir = (fase && fase.msgAlertaExibir) ?? '';
    this.contextoNegocio = (fase && fase.contextoNegocio) ?? '';
  }
}
