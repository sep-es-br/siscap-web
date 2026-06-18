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
import { IIndicadorAvulso } from '../../interfaces/indicador-avulso.interface';
import { IndicadorAvulsoFormType, MetaIndicadorAvulsoFormType } from '../../types/form/indicador-avulso-form.type';

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

  public construirindicadoresFormArray( indicadores?: Array<IIndicadores>)
    : FormArray<FormGroup<IndicadoresFormType>> {

    const indicadoresFormArray = this._nnfb.array<FormGroup<IndicadoresFormType>>([],
      [Validators.required, Validators.minLength(1),]);
    
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
      metasIndicadorProjeto: this._nnfb.array<FormGroup<MetaIndicadorExternoFormType>>(
        (membro?.metasIndicadorProjeto ?? []).map(meta =>
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
      id: this._nnfb.control(meta?.id ?? null, Validators.required),
      valorMeta: this._nnfb.control(meta?.valorMeta ?? null, Validators.required),
      anoMeta: this._nnfb.control(meta?.anoMeta ?? null, Validators.required),
    });
  }

  public construirindicadoresAvulsosFormArray(indicadores?: Array<IIndicadorAvulso>): FormArray<FormGroup<IndicadorAvulsoFormType>> {
    return this._nnfb.array<FormGroup<IndicadorAvulsoFormType>>(
      (indicadores ?? []).map(indicador =>
        this.construirIndicadorAvulsoFormGroup(indicador)
      )
    );
  }

  construirIndicadorAvulsoFormGroup(indicador: IIndicadorAvulso): FormGroup<IndicadorAvulsoFormType> {
    return this._nnfb.group<IndicadorAvulsoFormType>({
      id: this._nnfb.control(indicador?.id ?? null),
      idIndicador: this._nnfb.control(indicador?.idIndicador ?? 0),
      nomeIndicador: this._nnfb.control(indicador?.nomeIndicador ?? null),
      fonteIndicador: this._nnfb.control(indicador?.fonteIndicador ?? null),
      formulaCalculo: this._nnfb.control(indicador?.formulaCalculo ?? null),
      medidoPor: this._nnfb.control(indicador?.medidoPor ?? null),
      unidadeMedida: this._nnfb.control(indicador?.unidadeMedida ?? null),
      basedeReferencia: this._nnfb.control(indicador?.basedeReferencia ?? null),
      metasIndicadorProjeto: this._nnfb.array<FormGroup<MetaIndicadorAvulsoFormType>>(
        (indicador?.metasIndicadorProjeto ?? [])
        .sort((a, b) => Number(a.anoMeta) - Number(b.anoMeta))
        .map(meta =>
          this.construirMetaIndicadorAvulso(meta)
        )
      ),
    });
  }

  construirMetaIndicadorAvulso(meta: { id: number | null; anoMeta: number | null; valorMeta: string | null; }): any {
    return this._nnfb.group({
      id: this._nnfb.control(meta?.id ?? null),
      valorMeta: this._nnfb.control(meta?.valorMeta ?? null),
      anoMeta: this._nnfb.control(meta?.anoMeta ?? null),
    });
  }

}
