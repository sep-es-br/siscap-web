import { IRateio } from '../interfaces/rateio.interface';

export class RateioModel implements IRateio {
  public idLocalidade: number;
  public percentual: number;
  public quantia: number;

  constructor(rateio?: IRateio) {
    this.idLocalidade = rateio?.idLocalidade ?? 0;
    this.percentual = rateio?.percentual ?? 0;
    this.quantia = rateio?.quantia ?? 0;
  }
}
