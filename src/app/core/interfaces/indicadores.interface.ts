import { FormArray, FormGroup } from "@angular/forms";
import { MetaIndicadorExternoFormType } from "../types/form/indicadores-form.type";
import { IMetaIndicador } from "./indicadores-catalogo-externo.interface";

export interface IIndicadores {
  idIndicador: number;
  tipoIndicador: string | null;
  descricaoIndicador: string | null;
  descricaoMeta: string | null;
  idStatus: number;
  idIndicadorExterno: number | null;
  metasIndicadorProjeto: Array<{
    idFato: number | null;
    anoMeta: number | null;
    valorMeta: string | null;
  }>;
  ods: Array<{
    id: number | null;
    idOdsIndicadorExterno: number;
  }>;
}
