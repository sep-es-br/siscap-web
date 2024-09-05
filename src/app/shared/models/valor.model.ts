import { IValor } from '../interfaces/valor.interface';

export class ValorModel implements IValor {
  public tipo: number;
  public moeda: string;
  public quantia: number;

  constructor(valor?: IValor) {
    this.tipo = valor?.tipo ?? 0;
    this.moeda = valor?.moeda ?? '';
    this.quantia = valor?.quantia ?? 0;
  }
}
