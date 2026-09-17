import { RateioModel } from "../models/rateio.model";

export interface IAcao {
  idAcao: number;
  descricaoAcaoPrincipal: string | null;
  descricaoAcaoSecundaria: string | null;
  valorEstimadoAcaoPrincipal: number | null;
  idStatus: number;
  rateio?: RateioModel[];
}
