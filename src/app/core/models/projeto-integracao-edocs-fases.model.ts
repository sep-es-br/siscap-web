import { IProjetoIntegracaoEdocsFases } from '../interfaces/projeto-integracao-edcos-fases.interface';

export class ProjetoIntegracaoEdocsFasesModel implements IProjetoIntegracaoEdocsFases {
  
  public idProjeto: number;
  public etapa: string;
  public iniciada: boolean;
  public finalizada: boolean;
  public erro: boolean;
  public msgAlertaExibir: string;

    constructor(integracao?: IProjetoIntegracaoEdocsFases) {
      this.idProjeto = integracao?.idProjeto ?? 0;
      this.etapa = integracao?.etapa ?? '';
      this.iniciada = integracao?.iniciada ?? false;
      this.finalizada = integracao?.finalizada ?? false;
      this.erro = integracao?.erro ?? false;
      this.msgAlertaExibir = integracao?.msgAlertaExibir ?? '';
    }

}
