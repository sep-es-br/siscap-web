import { FormControl } from '@angular/forms';

export type EquipeFormType = {
  idPessoa: FormControl<number>;
  idPapel: FormControl<number | null>;
  idStatus: FormControl<number>;
  justificativa: FormControl<string | null>;
};
