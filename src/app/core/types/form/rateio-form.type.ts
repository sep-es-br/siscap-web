import { FormControl } from '@angular/forms';

export type RateioLocalidadeFormType = {
  idLocalidade: FormControl<number>;
  percentual: FormControl<number | null>;
  quantia: FormControl<number | null>;
};

export type RateioLocalidadeFormTypeValue = Partial<{
  idLocalidade: number;
  percentual: number | null;
  quantia: number | null;
}>;
