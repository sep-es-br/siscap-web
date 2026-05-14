import { FormArray, FormGroup } from "@angular/forms";
import { MetaIndicadorExternoFormType } from "../types/form/indicadores-form.type";
import { IMetaIndicador } from "./indicadores-catalogo-externo.interface";

export interface IIndicadorAvulso {
  idIndicador: number;
  nomeIndicador: string | null;
  fonteIndicador: string | null;
  medidoPor: string | null;
  unidadeMedida: string | null;
  basedeReferencia: string | null;
  metasIndicadorAvulsoGeral: Array<{
    idFato: number | null;
    anoMeta: number | null;
    valorMeta: string | null;
  }>;
  metasIndicadorAvulsoProjeto: Array<{
    anoMeta: number | null;
    valorMeta: string | null;
  }>;
}
