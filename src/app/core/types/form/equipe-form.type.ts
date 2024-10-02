import { FormControl } from '@angular/forms';

export type EquipeFormType = {
  idPessoa: FormControl<number>;
  idPapel: FormControl<number | null>;
  idStatus: FormControl<number>;
  justificativa: FormControl<string | null>;
};

export type EquipeFormTypeValue = Array<
  Partial<{
    idPessoa: number;
    idPapel: number | null;
    idStatus: number;
    justificativa: string | null;
  }>
>;
