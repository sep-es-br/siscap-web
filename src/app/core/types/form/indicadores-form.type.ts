import { FormControl } from '@angular/forms';

export type IndicadoresFormType = {
  idIndicador: FormControl<number>;
  descricao: FormControl<string | null>;
  meta: FormControl<string | null>;
  idStatus: FormControl<number>;
};

export type IndicadoresFormTypeValue = Array<
  Partial<{
    idIndicador: number;
    descricao: string | null;
    meta: string | null;
    idStatus: number;
  }>
>;
