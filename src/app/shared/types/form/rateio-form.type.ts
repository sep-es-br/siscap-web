import { FormControl } from '@angular/forms';

export type RateioMicrorregiaoFormType = {
  idMicrorregiao: FormControl<number>;
  percentual: FormControl<number | null>;
  quantia: FormControl<number | null>;
};

export type RateioMicrorregiaoFormTypeValue = Partial<{
  idMicrorregiao: number;
  percentual: number | null;
  quantia: number | null;
}>;

export type RateioCidadeFormType = {
  idCidade: FormControl<number>;
  percentual: FormControl<number | null>;
  quantia: FormControl<number | null>;
};

export type RateioCidadeFormTypeValue = Partial<{
  idCidade: number;
  percentual: number | null;
  quantia: number | null;
}>;
