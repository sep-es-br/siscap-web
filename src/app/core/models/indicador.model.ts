import { IEquipe } from '../interfaces/equipe.interface';
import { IIndicadores } from '../interfaces/indicadores.interface';

export class IndicadorModel implements IIndicadores {
  public idIndicador: number = 0;
  public tipoIndicador: string | null = null;
  public descricaoIndicador: string | null = null;
  public descricaoMeta: string | null = null;
  public idStatus: number = 0;

  constructor(indicadores?: IIndicadores) {
    this.idIndicador = indicadores?.idIndicador ?? 0;
    this.tipoIndicador = indicadores?.tipoIndicador ?? null;
    this.descricaoIndicador = indicadores?.descricaoIndicador ?? null;
    this.descricaoMeta = indicadores?.descricaoMeta ?? null;
    this.idStatus = indicadores?.idStatus ?? 0;
  }

}