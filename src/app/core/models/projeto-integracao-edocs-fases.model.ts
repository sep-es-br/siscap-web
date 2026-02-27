import { IProjetoIntegracaoEdocsFases } from '../interfaces/projeto-integracao-edcos-fases.interface';

export class ProjetoIntegracaoEdocsFasesModel implements IProjetoIntegracaoEdocsFases {
  
  public id: number;
  public etapa: string;
  public iniciada: boolean;
  public finalizada: boolean;
  public erro: boolean;
  public msgAlertaExibir: string;
  public contextoNegocio: string;

    constructor(integracao?: IProjetoIntegracaoEdocsFases) {
      this.id = integracao?.id ?? 0;
      this.etapa = integracao?.etapa ?? '';
      this.iniciada = integracao?.iniciada ?? false;
      this.finalizada = integracao?.finalizada ?? false;
      this.erro = integracao?.erro ?? false;
      this.msgAlertaExibir = integracao?.msgAlertaExibir ?? '';
      this.contextoNegocio = integracao?.contextoNegocio ?? '';
    }

}
