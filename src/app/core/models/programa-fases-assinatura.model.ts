import { IProgramaAssinaturaFases } from "../interfaces/programa.interface";

export class ProgramaFasesAssinaturaModel implements IProgramaAssinaturaFases {
  public idPrograma: number;
  public etapa: string;
  public iniciada: boolean;
  public finalizada: boolean;
  public erro: boolean;
  public msgAlertaExibir: string;

    constructor(fase?: IProgramaAssinaturaFases) {
      this.idPrograma = (fase && fase.idPrograma) ?? 0;
      this.etapa = (fase && fase.etapa) ?? '';
      this.iniciada = (fase && fase.iniciada) ?? false;
      this.finalizada = (fase && fase.finalizada) ?? false;
      this.erro = (fase && fase.erro) ?? false;
      this.msgAlertaExibir = (fase && fase.msgAlertaExibir) ?? '';
    }
}