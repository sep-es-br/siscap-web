import { FormArray, FormGroup } from "@angular/forms";
import { RateioLocalidadeFormType } from "../types/form/rateio-form.type";

export interface IAcao {
  idAcao: number;
  descricaoAcaoPrincipal: string | null;
  descricaoAcaoSecundaria: string | null;
  valorEstimadoAcaoPrincipal: number | null;
  idStatus: number;
  rateio: FormArray<FormGroup<RateioLocalidadeFormType>>;
}
