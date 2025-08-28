import { IProjetoIntegracaoEdocsFases } from '../interfaces/projeto-integracao-edcos-fases.interface';

export class ProjetoIntegracaoEdocsFasesModel implements IProjetoIntegracaoEdocsFases {
  
  public idProjeto: number;
  public etapa: string;
  public iniciada: boolean;
  public finalizada: boolean;

    constructor(integracao?: IProjetoIntegracaoEdocsFases) {
      this.idProjeto = integracao?.idProjeto ?? 0;
      this.etapa = integracao?.etapa ?? '';
      this.iniciada = integracao?.iniciada ?? false;
      this.finalizada = integracao?.finalizada ?? false;
    }

}
