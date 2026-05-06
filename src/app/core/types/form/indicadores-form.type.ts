import { FormArray, FormControl, FormGroup } from '@angular/forms';

export type IndicadoresFormType = {
  idIndicador: FormControl<number>;
  tipoIndicador: FormControl<string | null>;
  descricaoIndicador: FormControl<string | null>;
  descricaoMeta: FormControl<string | null>;
  idStatus: FormControl<number>;
  idIndicadorCatalogoExterno: FormControl<number | null>;
  metasIndicadorExterno: FormArray<FormGroup<MetaIndicadorExternoFormType>>;
};

export type IndicadoresFormTypeValue = Array<
  Partial<{
    idIndicador: number;
    tipoIndicador: string | null;
    descricaoIndicador: string | null;
    descricaoMeta: string | null;
    idStatus: number;
    idIndicadorCatalogoExterno: number | null;
    metasIndicadorExterno: FormArray<FormGroup<MetaIndicadorExternoFormType>>;
  }>
>;

export type MetaIndicadorExternoFormType = {
  idFato: FormControl<number | null>;
  anoMeta: FormControl<number | null>;
  valorMeta: FormControl<string | null>;
};

