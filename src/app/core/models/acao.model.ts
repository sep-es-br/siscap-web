import { IAcao } from '../interfaces/acoes.interface';
import { RateioModel } from './rateio.model';

export class AcaoModel implements IAcao {
  public idAcao: number = 0;
  public descricaoAcaoPrincipal: string | null = null;
  public descricaoAcaoSecundaria: string | null = null;
  public valorEstimadoAcaoPrincipal: number | null = null;
  public idStatus: number = 0;
  public rateio?: RateioModel[];

  constructor(acao?: IAcao) {
    this.idAcao = acao?.idAcao ?? 0;
    this.descricaoAcaoPrincipal = acao?.descricaoAcaoPrincipal ?? null;
    this.descricaoAcaoSecundaria = acao?.descricaoAcaoSecundaria ?? null;
    this.valorEstimadoAcaoPrincipal = acao?.valorEstimadoAcaoPrincipal ?? 0;
    this.idStatus = acao?.idStatus ?? 0;
    this.rateio = acao?.rateio?.map( (r) => new RateioModel(r)) ?? [];
  }

}