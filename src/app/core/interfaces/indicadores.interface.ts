import { IMetaIndicador } from "./indicadores-catalogo-externo.interface";

export interface IIndicadores {
  idIndicador: number;
  tipoIndicador: string | null;
  descricaoIndicador: string | null;
  descricaoMeta: string | null;
  idStatus: number;
}
