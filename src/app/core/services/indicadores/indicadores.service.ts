import { Injectable } from '@angular/core';
import {
  FormArray,
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  Validators,
} from '@angular/forms';

import { Subject } from 'rxjs';
import { IIndicadores } from '../../interfaces/indicadores.interface';
import { IndicadoresFormType, MetaIndicadorExternoFormType } from '../../types/form/indicadores-form.type';
import { TipoStatusEnum } from '../../enums/tipo-status.enum';

@Injectable({
  providedIn: 'root',
})
export class IndicadoresService {

  public indicadoresFormArray: FormArray<FormGroup<IndicadoresFormType>> = new FormArray<
    FormGroup<IndicadoresFormType>
  >([]);

  private _indicadoresFormArraySnapshot: Array<IIndicadores> = [];

  public get indicadoresFormArraySnapshot(): Array<IIndicadores> {
    return this._indicadoresFormArraySnapshot;
  }

  private set indicadoresFormArraySnapshot(indicadoresFormArrayValue: Array<IIndicadores>) {
    this._indicadoresFormArraySnapshot = indicadoresFormArrayValue;
  }

  private readonly _idIndicadorIndicadoresValue$: Subject<number> = new Subject<number>();

  public get idIndicadorIndicadoresValue$(): Subject<number> {
    return this._idIndicadorIndicadoresValue$;
  }

  public excluirMembroForm: FormGroup = new FormGroup({});

  public get excluirMembroFormMembroStatusFormControl(): FormControl<
    number | null
  > {
    return this.excluirMembroForm.get('membroStatus') as FormControl<
      number | null
    >;
  }

  public get excluirMembroFormJustificativaFormControl(): FormControl<
    string | null
  > {
    return this.excluirMembroForm.get('justificativa') as FormControl<
      string | null
    >;
  }

  constructor(private _nnfb: NonNullableFormBuilder) {

  }

  public construirindicadoresFormArray(
    indicadores?: Array<IIndicadores>
  ): FormArray<FormGroup<IndicadoresFormType>> {
    const indicadoresFormArray = this._nnfb.array<FormGroup<IndicadoresFormType>>([],);
    if (indicadores) {
      indicadores.forEach((indicador) => {
        indicadoresFormArray.push(this.construirIndicadorFormGroup(indicador));
      });
    }
    this.indicadoresFormArray = indicadoresFormArray;
    this.indicadoresFormArraySnapshot = this.indicadoresFormArray.value as Array<IIndicadores>;
    return this.indicadoresFormArray;
  }

  public construirIndicadorFormGroup(membro?: IIndicadores): FormGroup<IndicadoresFormType> {
    return this._nnfb.group<IndicadoresFormType>({
      idIndicador: this._nnfb.control(membro?.idIndicador ?? 0, [Validators.required]),
      tipoIndicador: this._nnfb.control(membro?.tipoIndicador ?? null, [Validators.required]),
      descricaoIndicador: this._nnfb.control(membro?.descricaoIndicador ?? null, [Validators.required]),
      descricaoMeta: this._nnfb.control(membro?.descricaoMeta ?? null, [Validators.required]),
      idStatus: this._nnfb.control(membro?.idStatus ?? TipoStatusEnum.Ativo,),
      idIndicadorCatalogoExterno: this._nnfb.control(membro?.idIndicadorExterno ?? null),
      metasIndicadorExterno: this._nnfb.array<FormGroup<MetaIndicadorExternoFormType>>(
        (membro?.metas ?? []).map(meta =>
          this.construirMetaIndicadorExterno(meta)
        )
      )
    });
  }

  public removerIndicador(index: number): void {
    this.indicadoresFormArray.removeAt(index);
  }

  private construirMetaIndicadorExterno(meta?: any): FormGroup<MetaIndicadorExternoFormType> {
    return this._nnfb.group({
      valorMeta: this._nnfb.control(meta?.valorMeta ?? null, Validators.required),
      anoMeta: this._nnfb.control(meta?.anoMeta ?? null, Validators.required),
    });
  }

}
