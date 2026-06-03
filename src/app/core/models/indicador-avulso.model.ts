import { IEquipe } from '../interfaces/equipe.interface';
import { IIndicadorAvulso } from '../interfaces/indicador-avulso.interface';
import { IIndicadores } from '../interfaces/indicadores.interface';

export class IndicadorAvulsoModel implements IIndicadorAvulso {
  public id: number;
  public idIndicador: number;
  public nomeIndicador: string | null;
  public formulaCalculo: string | null;
  public fonteIndicador: string | null;
  public medidoPor: string | null;
  public unidadeMedida: string | null;
  public basedeReferencia: string | null;

  public metasIndicadorProjeto: Array<{
    id: number;
    anoMeta: number | null;
    valorMeta: string | null;
  }>;

  constructor(indicadores?: IIndicadorAvulso) {
    this.id = indicadores?.id ?? 0;
    this.idIndicador = indicadores?.idIndicador ?? 0;
    this.nomeIndicador = indicadores?.nomeIndicador ?? null;
    this.formulaCalculo = indicadores?.formulaCalculo ?? null;
    this.fonteIndicador = indicadores?.fonteIndicador ?? null;
    this.medidoPor = indicadores?.medidoPor ?? null;
    this.unidadeMedida = indicadores?.unidadeMedida ?? null;
    this.basedeReferencia = indicadores?.basedeReferencia ?? null;
    this.metasIndicadorProjeto = indicadores?.metasIndicadorProjeto ?? [];
  }
  

}