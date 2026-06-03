import { FormArray, FormGroup } from "@angular/forms";
import { MetaIndicadorExternoFormType } from "../types/form/indicadores-form.type";
import { IMetaIndicador } from "./indicadores-catalogo-externo.interface";

export interface IIndicadorAvulso {
  id: number;
  idIndicador: number;
  nomeIndicador: string | null;
  formulaCalculo: string | null;
  fonteIndicador: string | null;
  medidoPor: string | null;
  unidadeMedida: string | null;
  basedeReferencia: string | null;
  metasIndicadorProjeto: Array<{
    anoMeta: number | null;
    valorMeta: string | null;
  }>;

}
