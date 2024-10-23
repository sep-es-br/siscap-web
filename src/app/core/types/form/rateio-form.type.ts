import { FormArray, FormControl, FormGroup } from '@angular/forms';

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

// export type RateioFormType = {
//   rateioMicrorregiao: FormArray<FormGroup<RateioMicrorregiaoFormType>>;
//   rateioCidade: FormArray<FormGroup<RateioCidadeFormType>>;
// };

// export type RateioFormTypeValue = Partial<{
//   rateioMicrorregiao: Array<RateioMicrorregiaoFormTypeValue>;
//   rateioCidade: Array<RateioCidadeFormTypeValue>;
// }>;

// export type RateioMicrorregiaoFormType = {
//   idMicrorregiao: FormControl<number>;
//   percentual: FormControl<number | null>;
//   quantia: FormControl<number | null>;
// };

// export type RateioMicrorregiaoFormTypeValue = Partial<{
//   idMicrorregiao: number;
//   percentual: number | null;
//   quantia: number | null;
// }>;

// export type RateioCidadeFormType = {
//   idCidade: FormControl<number>;
//   percentual: FormControl<number | null>;
//   quantia: FormControl<number | null>;
// };

// export type RateioCidadeFormTypeValue = Partial<{
//   idCidade: number;
//   percentual: number | null;
//   quantia: number | null;
// }>;
