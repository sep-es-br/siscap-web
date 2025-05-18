import { FormControl } from '@angular/forms';

export type IndicadoresFormType = {
  tipoIndicador: FormControl<string | null>;
  descricaoIndicador: FormControl<string | null>;
  metaIndicador: FormControl<string | null>;
  idStatus: FormControl<number>;
};

export type IndicadoresFormTypeValue = Array<
  Partial<{
    tipoIndicador: string | null;
    descricaoIndicador: string | null;
    metaIndicador: string | null;
    idStatus: number;
  }>
>;
