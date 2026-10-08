import { IProjetoIntegracaoEdocsFases } from '../interfaces/projeto-integracao-edcos-fases.interface';

export class ProjetoIntegracaoEdocsFasesModel implements IProjetoIntegracaoEdocsFases {
  
  public id: number;
  public etapa: string;
  public iniciada: boolean;
  public finalizada: boolean;
  public erro: boolean;
  public msgAlertaExibir: string;
  public contextoNegocio: string;
  public tokenExpirado: boolean = false;
  public pdfConcluido?: boolean | null;
  public assinaturaConcluida?: boolean | null;
  public capturaConcluida?: boolean | null;
  public avisos: string[] = [];
  public encerramentoIniciado?: boolean | null;
  public encerramentoConcluido?: boolean | null;
  public erroEncerramento?: boolean | null;

    constructor(integracao?: IProjetoIntegracaoEdocsFases) {
      this.id = integracao?.id ?? 0;
      this.etapa = integracao?.etapa ?? '';
      this.iniciada = integracao?.iniciada ?? false;
      this.finalizada = integracao?.finalizada ?? false;
      this.erro = integracao?.erro ?? false;
      this.msgAlertaExibir = integracao?.msgAlertaExibir ?? '';
      this.contextoNegocio = integracao?.contextoNegocio ?? '';
      this.tokenExpirado = integracao?.tokenExpirado ?? false;
      this.pdfConcluido = integracao?.pdfConcluido;
      this.assinaturaConcluida = integracao?.assinaturaConcluida;
      this.capturaConcluida = integracao?.capturaConcluida;
      this.avisos = integracao?.avisos ?? [];
      this.encerramentoIniciado = integracao?.encerramentoIniciado;
      this.encerramentoConcluido = integracao?.encerramentoConcluido;
      this.erroEncerramento = integracao?.erroEncerramento;
    }

}
