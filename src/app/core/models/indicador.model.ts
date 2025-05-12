import { IEquipe } from '../interfaces/equipe.interface';
import { IIndicadores } from '../interfaces/indicadores.interface';

export class IndicadorModel implements IIndicadores {
  public idIndicador: number = 0;
  public descricao: string | null = null;
  public meta: string | null = null;
  public idStatus: number = 0;

  constructor(indicadores?: IIndicadores) {
    this.idIndicador = indicadores?.idIndicador ?? 0;
    this.descricao = indicadores?.descricao ?? null;
    this.meta = indicadores?.meta ?? null;
    this.idStatus = indicadores?.idStatus ?? 0;
  }

}