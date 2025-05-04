import { FormControl } from '@angular/forms';

export type EquipeFormType = {
  subPessoa: FormControl<string | null>;
  idPessoa: FormControl<number>;
  idPapel: FormControl<number | null>;
  idStatus: FormControl<number>;
  justificativa: FormControl<string | null>;
};

export type EquipeFormTypeValue = Array<
  Partial<{
    subPessoa: string | null;
    idPessoa: number;
    idPapel: number | null;
    idStatus: number;
    justificativa: string | null;
  }>
>;
