import { FormArray, FormControl, FormGroup } from '@angular/forms';

export type IndicadorAvulsoFormType = {
  idIndicador: FormControl<number>;
  nomeIndicador: FormControl<string | null>;
  fonteIndicador: FormControl<string | null>;
  medidoPor: FormControl<string | null>;
  unidadeMedida: FormControl<string | null>;
  basedeReferencia: FormControl<string | null>;
  metasIndicador: FormArray<FormGroup<MetaIndicadorAvulsoFormType>>;
  metasIndicadorProjeto: FormArray<FormGroup<MetaIndicadorAvulsoFormType>>;
};

export type IndicadorAvulsoFormTypeValue = Array<
  Partial<{
    idIndicador: number;
    nomeIndicador: string | null;
    fonteIndicador: string | null;
    medidoPor: string | null;
    unidadeMedida: string | null;
    basedeReferencia: string | null;
    metasIndicador: FormArray<FormGroup<MetaIndicadorAvulsoFormType>>;
    metasIndicadorProjeto: FormArray<FormGroup<MetaIndicadorAvulsoFormType>>;
  }>
>;

export type MetaIndicadorAvulsoFormType = {
  anoMeta: FormControl<number | null>;
  valorMeta: FormControl<string | null>;
};

