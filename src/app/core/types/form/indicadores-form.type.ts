import { FormControl } from '@angular/forms';

export type IndicadoresFormType = {
  idIndicador: FormControl<number>;
  tipoIndicador: FormControl<string | null>;
  descricaoIndicador: FormControl<string | null>;
  descricaoMeta: FormControl<string | null>;
  idStatus: FormControl<number>;
};

export type IndicadoresFormTypeValue = Array<
  Partial<{
    idIndicador: number;
    tipoIndicador: string | null;
    descricaoIndicador: string | null;
    descricaoMeta: string | null;
    idStatus: number;
  }>
>;
