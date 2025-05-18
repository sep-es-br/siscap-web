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
import { IndicadoresFormType } from '../../types/form/indicadores-form.type';
import { TipoStatusEnum } from '../../enums/tipo-status.enum';
import { IOpcoesDropdown } from '../../interfaces/opcoes-dropdown.interface';
import { IAcao } from '../../interfaces/acoes.interface';
import { AcaoFormType } from '../../types/form/acao-form.type';

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
    const indicadoresFormArray = this._nnfb.array<FormGroup<IndicadoresFormType>>([], [Validators.required, Validators.minLength(1)] );
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
      tipoIndicador: this._nnfb.control(membro?.tipoIndicador ?? null, Validators.required),
      descricaoIndicador: this._nnfb.control(membro?.descricaoIndicador ??null, Validators.required),
      metaIndicador: this._nnfb.control(membro?.metaIndicador ?? null, Validators.required),
      idStatus: this._nnfb.control(
        membro?.idStatus ?? TipoStatusEnum.Ativo,
        Validators.required
      ),
    });
  }

  public construirIndicadorFormGroupNgSelectValue(
    ngSelectValue: string
  ): FormGroup<IndicadoresFormType> {
    const membroFormGroup = this.construirIndicadorFormGroup();
    membroFormGroup.patchValue({ tipoIndicador: ngSelectValue });
    return membroFormGroup;
  }
  
  /*
  public incluirIndicador(
    indicadorFormGroup: FormGroup<IndicadoresFormType>
  ): void {
    this.indicadoresFormArray.push(indicadorFormGroup);
  } */

  public removerIndicador(index: number): void {
    this.indicadoresFormArray.removeAt(index);
  }

  public construirExcluirIndicadorForm(): FormGroup {
    const excluirIndicadorForm = this._nnfb.group({
      membroStatus: this._nnfb.control(null, Validators.required),
      justificativa: this._nnfb.control(null, [
        Validators.required,
        Validators.maxLength(255),
      ]),
    });
    this.excluirMembroForm = excluirIndicadorForm;
    return this.excluirMembroForm;
  }

  /*
  public filtrarIndicadoresOpcoes(
      tiposIndicadorOpcoes: IOpcoesDropdown[]
    ): IOpcoesDropdown[] {
      return tiposIndicadorOpcoes.filter(
        (tipoindicador) =>
          !this.indicadoresFormArray.value.some(
            (tipoIndicador) => tipoIndicador.tipoIndicador === tipoindicador.id
          )
      );
    }
      */

}
