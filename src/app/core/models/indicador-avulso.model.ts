import { IEquipe } from '../interfaces/equipe.interface';
import { IIndicadorAvulso } from '../interfaces/indicador-avulso.interface';
import { IIndicadores } from '../interfaces/indicadores.interface';

export class IndicadorAvulsoModel implements IIndicadorAvulso {

  public idIndicador: number;
  public nomeIndicador: string | null;
  public fonteIndicador: string | null;
  public medidoPor: string | null;
  public unidadeMedida: string | null;
  public basedeReferencia: string | null;
  public metasIndicadorProjeto: Array<{
    idFato: number | null;
    anoMeta: number | null;
    valorMeta: string | null;
  }>;
  public metasIndicadorAvulsoProjeto: Array<{
    anoMeta: number | null;
    valorMeta: string | null;
  }>;

  constructor(indicadores?: IIndicadorAvulso) {
    this.idIndicador = indicadores?.idIndicador ?? 0;
    this.nomeIndicador = indicadores?.nomeIndicador ?? null;
    this.fonteIndicador = indicadores?.fonteIndicador ?? null;
    this.medidoPor = indicadores?.medidoPor ?? null;
    this.unidadeMedida = indicadores?.unidadeMedida ?? null;
    this.basedeReferencia = indicadores?.basedeReferencia ?? null;
    this.metasIndicadorProjeto = indicadores?.metasIndicadorProjeto ?? [];
    this.metasIndicadorAvulsoProjeto = indicadores?.metasIndicadorAvulsoProjeto ?? [];
  }
  

}