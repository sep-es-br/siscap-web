import { IProgramaAssinaturaFases, ProgramaAssinaturasEtapas } from '../interfaces/programa.interface';

export class ProgramaFasesAssinaturaModel implements IProgramaAssinaturaFases {
  public id: number;
  public etapa: ProgramaAssinaturasEtapas;
  public iniciada: boolean;
  public finalizada: boolean;
  public erro: boolean;
  public msgAlertaExibir: string;
  public contextoNegocio: string;

  constructor(fase?: IProgramaAssinaturaFases) {
    this.id = (fase && fase.id) ?? 0;
    this.etapa = (fase && fase.etapa) ?? ProgramaAssinaturasEtapas.CAPTURA_ASSINATURA_PENDENTE;
    this.iniciada = (fase && fase.iniciada) ?? false;
    this.finalizada = (fase && fase.finalizada) ?? false;
    this.erro = (fase && fase.erro) ?? false;
    this.msgAlertaExibir = (fase && fase.msgAlertaExibir) ?? '';
    this.contextoNegocio = (fase && fase.contextoNegocio) ?? '';
  }
}
