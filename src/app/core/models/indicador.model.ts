import { IEquipe } from '../interfaces/equipe.interface';
import { IIndicadores } from '../interfaces/indicadores.interface';

export class IndicadorModel implements IIndicadores {
  public idIndicador: number = 0;
  public tipoIndicador: number = 0;
  public descricaoIndicador: string | null = null;
  public metaIndicador: string | null = null;
  public idStatus: number = 0;

  constructor(indicadores?: IIndicadores) {
    this.idIndicador = indicadores?.idIndicador ?? 0;
    this.tipoIndicador = indicadores?.tipoIndicador ?? 0;
    this.descricaoIndicador = indicadores?.descricaoIndicador ?? null;
    this.metaIndicador = indicadores?.metaIndicador ?? null;
    this.idStatus = indicadores?.idStatus ?? 0;
  }

}