import {
  IRateio,
  IRateioCidade,
  IRateioMicrorregiao,
} from '../interfaces/rateio.interface';

export class RateioModel implements IRateio {
  public rateioMicrorregiao: Array<IRateioMicrorregiao> = [];
  public rateioCidade: Array<IRateioCidade> = [];

  constructor(rateio?: IRateio) {
    this.rateioMicrorregiao = this.contruirRateioMicrorregiao(
      rateio?.rateioMicrorregiao
    );
    this.rateioCidade = this.construirRateioCidade(rateio?.rateioCidade);
  }

  private contruirRateioMicrorregiao(
    rateioMicrorregiao?: Array<IRateioMicrorregiao>
  ): Array<RateioMicrorregiaoModel> {
    if (!rateioMicrorregiao) {
      return [];
    }

    return rateioMicrorregiao.map(
      (microrregiao) => new RateioMicrorregiaoModel(microrregiao)
    );
  }

  private construirRateioCidade(
    rateioCidade?: Array<IRateioCidade>
  ): Array<RateioCidadeModel> {
    if (!rateioCidade) {
      return [];
    }

    return rateioCidade.map((cidade) => new RateioCidadeModel(cidade));
  }
}

export class RateioMicrorregiaoModel implements IRateioMicrorregiao {
  public idMicrorregiao: number = 0;
  public percentual: number = 0;
  public quantia: number = 0;

  constructor(microrregiao?: IRateioMicrorregiao) {
    this.idMicrorregiao = microrregiao?.idMicrorregiao ?? 0;
    this.percentual = microrregiao?.percentual ?? 0;
    this.quantia = microrregiao?.quantia ?? 0;
  }
}

export class RateioCidadeModel implements IRateioCidade {
  public idCidade: number = 0;
  public percentual: number = 0;
  public quantia: number = 0;

  constructor(cidade?: IRateioCidade) {
    this.idCidade = cidade?.idCidade ?? 0;
    this.percentual = cidade?.percentual ?? 0;
    this.quantia = cidade?.quantia ?? 0;
  }
}
