import { Injectable } from '@angular/core';
import {
  FormArray,
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  Validators,
} from '@angular/forms';

import { Subject } from 'rxjs';

import { IOpcoesDropdownResponsavelProponente } from '../../interfaces/opcoes-dropdown.interface';
import { IIndicadores } from '../../interfaces/indicadores.interface';

import { IndicadoresFormType } from '../../types/form/indicadores-form.type';

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
    this.idIndicadorIndicadoresValue$.subscribe((idIndicadorIndicadoresValue: number) => {
      this.incluirMembroNaEquipe(
        this.construirIndicadorFormGroupNgSelectValue(idIndicadorIndicadoresValue)
      );
    });
  }

  public construirindicadoresFormArray(
    equipe?: Array<IIndicadores>
  ): FormArray<FormGroup<IndicadoresFormType>> {

    const indicadoresFormArray = this._nnfb.array<FormGroup<IndicadoresFormType>>([], [Validators.required, Validators.minLength(1)] );

    if (equipe) {
      equipe.forEach((membro) => {
        indicadoresFormArray.push(this.construirIndicadorFormGroup(membro));
      });
    }

    this.indicadoresFormArray = indicadoresFormArray;
    this.indicadoresFormArraySnapshot = this.indicadoresFormArray.value as Array<IIndicadores>;

    return this.indicadoresFormArray;
  }

  public construirIndicadorFormGroup(membro?: IIndicadores): FormGroup<IndicadoresFormType> {
    return this._nnfb.group<IndicadoresFormType>({
      idIndicador: this._nnfb.control(membro?.idIndicador ?? 0, Validators.required),
      descricao: this._nnfb.control(membro?.descricao ??null, Validators.required),
      meta: this._nnfb.control(membro?.meta ?? null, Validators.required),
      idStatus: this._nnfb.control(
        membro?.idStatus ?? TipoStatusEnum.Ativo,
        Validators.required
      ),
    });
  }

  public construirIndicadorFormGroupNgSelectValue(
    ngSelectValue: number
  ): FormGroup<IndicadoresFormType> {
    const membroFormGroup = this.construirIndicadorFormGroup();
    membroFormGroup.patchValue({ idIndicador: ngSelectValue });
    return membroFormGroup;
  }

  /*
  public usuarioProponenteValoresIniciaisindicadoresFormArray(
    usuarioProponente_IdPessoa: number
  ): void {
    const usuarioProponente_IIndicadores: IIndicadores = {
      subPessoa: null,
      idPessoa: usuarioProponente_IdPessoa,
      idPapel: TipoPapelEnum.Proponente,
      idStatus: TipoStatusEnum.Ativo,
      justificativa: null,
    };
    const usuarioProponente_MembroFormGroup = this.construirIndicadorFormGroup(
      usuarioProponente_IIndicadores
    );
    this.incluirMembroNaEquipe(usuarioProponente_MembroFormGroup);
  } */

  public incluirMembroNaEquipe(
    membroFormGroup: FormGroup<IndicadoresFormType>
  ): void {
    this.indicadoresFormArray.push(membroFormGroup);
  }

  public removerMembroDaEquipe(index: number): void {
    this.indicadoresFormArray.removeAt(index);
  }

  public construirExcluirMembroForm(): FormGroup {
    const excluirMembroForm = this._nnfb.group({
      membroStatus: this._nnfb.control(null, Validators.required),
      justificativa: this._nnfb.control(null, [
        Validators.required,
        Validators.maxLength(255),
      ]),
    });

    this.excluirMembroForm = excluirMembroForm;

    return this.excluirMembroForm;
  }

}
