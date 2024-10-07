import { FormControl } from '@angular/forms';

export type ValorFormType = {
  tipo: FormControl<number | null>;
  moeda: FormControl<string | null>;
  quantia: FormControl<number | null>;
};

export type ValorFormTypeValue = Partial<{
  tipo: number | null;
  moeda: string | null;
  quantia: number | null;
}>;
