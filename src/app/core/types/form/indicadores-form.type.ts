import { FormControl } from '@angular/forms';

export type IndicadoresFormType = {
  tipoIndicador: FormControl<number | 0>;
  descricaoIndicador: FormControl<string | null>;
  metaIndicador: FormControl<string | null>;
  idStatus: FormControl<number>;
};

export type IndicadoresFormTypeValue = Array<
  Partial<{
    tipoIndicador: number | 0;
    descricaoIndicador: string | null;
    metaIndicador: string | null;
    idStatus: number;
  }>
>;
