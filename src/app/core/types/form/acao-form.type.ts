import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { RateioLocalidadeFormType } from './rateio-form.type';

export type AcaoFormType = {
  idAcao: FormControl<number>;
  descricaoAcaoPrincipal: FormControl<string | null>;
  descricaoAcaoSecundaria: FormControl<string | null>;
  valorEstimadoAcaoPrincipal: FormControl<number>;
  idStatus: FormControl<number>;
  rateio: FormArray<FormGroup<RateioLocalidadeFormType>>;
};

export type AcaoFormTypeValue = Array<
  Partial<{
    idAcao: number;
    descricaoAcaoPrincipal: string | null;
    descricaoAcaoSecundaria: string | null;
    valorEstimadoAcaoPrincipal: number;
    idStatus: number;
  }>
>;
