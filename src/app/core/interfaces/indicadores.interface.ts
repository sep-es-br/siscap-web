import { FormArray, FormGroup } from "@angular/forms";
import { MetaIndicadorExternoFormType } from "../types/form/indicadores-form.type";
import { IMetaIndicador } from "./indicadores-catalogo-externo.interface";

export interface IIndicadores {
  idIndicador: number;
  tipoIndicador: string | null;
  descricaoIndicador: string | null;
  descricaoMeta: string | null;
  idStatus: number;
  idIndicadorCatalogoExterno: number | null;
  metasIndicadorExterno: Array<{
    anoMeta: number | null;
    valorMeta: number | null;
  }>;
}
