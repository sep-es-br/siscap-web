import { Injectable } from '@angular/core';
import {
  FormArray,
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  Validators,
} from '@angular/forms';

import { Subject } from 'rxjs';
import { TipoStatusEnum } from '../../enums/tipo-status.enum';
import { IOpcoesDropdown } from '../../interfaces/opcoes-dropdown.interface';
import { IAcao } from '../../interfaces/acoes.interface';
import { AcaoFormType } from '../../types/form/acao-form.type';
import { limiteAcoesValidator } from '../../validators/acoes.validator';
import { noWhitespaceValidator } from '../../validators/nowhitespacevalidator.validator';
import { RateioService } from '../rateio/rateio.service';

@Injectable({
  providedIn: 'root',
})
export class AcoesService {

  public acoesFormArray: FormArray<FormGroup<AcaoFormType>> = new FormArray<
    FormGroup<AcaoFormType>
  >([]);

  private _simboloMoeda: string = '';

  public get simboloMoeda(): string {
    return this._simboloMoeda;
  }

  private _quantiaFormControlReferencia: number | null = null;

  public get quantiaFormControlReferencia(): number | null {
    return this._quantiaFormControlReferencia;
  }

  private set quantiaFormControlReferencia(quantia: number | null) {
    this._quantiaFormControlReferencia = quantia;
  }

  private _acoesFormArraySnapshot: Array<IAcao> = [];

  public get acoesFormArraySnapshot(): Array<IAcao> {
    return this._acoesFormArraySnapshot;
  }

  private set acoesFormArraySnapshot(indicadoresFormArrayValue: Array<IAcao>) {
    this._acoesFormArraySnapshot = indicadoresFormArrayValue;
  }

  private _totalAcoes: { percentual: number; quantia: number } = {
    percentual: 0,
    quantia: 0,
  };

  public get totalAcoes(): { percentual: number; quantia: number } {
    return this._totalAcoes;
  }

  private set totalAcoes(totalAcoes: {
    percentual: number;
    quantia: number;
  }) {
    this._totalAcoes = totalAcoes;
  }

  private readonly _idAcaoAcoesValue$: Subject<number> = new Subject<number>();

  public get idAcaoAcoesValue$(): Subject<number> {
    return this._idAcaoAcoesValue$;
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

  public acoesWarnings: { [key: string]: boolean } = {};

  constructor(private _nnfb: NonNullableFormBuilder,
    public rateioService: RateioService
  ) {
    this.idAcaoAcoesValue$.subscribe((idAcaoAcoesValue: number) => {
      const indicadorMontado = this.construirAcaoFormGroupNgSelectValue(idAcaoAcoesValue);
      this.incluirAcao(indicadorMontado);
    });
  }

  public construirAcaoFormGroupNgSelectValue(
    ngSelectValue: number
  ): FormGroup<AcaoFormType> {
    const membroFormGroup = this.construirAcaoFormGroup();
    return membroFormGroup;
  }


  public construirAcoesFormArray(
    acoes?: Array<IAcao>
  ): FormArray<FormGroup<AcaoFormType>> {

    const acoesFormArray = this._nnfb.array<FormGroup<AcaoFormType>>(
      [],
      [Validators.required, Validators.minLength(1),]);

    if (acoes) {
      acoes.forEach((acao) => {
        acoesFormArray.push(this.construirAcaoFormGroup(acao));
      });
    }

    this.acoesFormArray = acoesFormArray;
    this.acoesFormArraySnapshot = this.acoesFormArray.value as Array<IAcao>;
    return this.acoesFormArray;
  }

  public construirAcaoFormGroup(membro?: IAcao): FormGroup<AcaoFormType> {

    // return this._nnfb.group<AcaoFormType>({
    //   idAcao: this._nnfb.control(membro?.idAcao ?? 0),
    //   descricaoAcaoPrincipal: this._nnfb.control(membro?.descricaoAcaoPrincipal ?? null, [ Validators.required, noWhitespaceValidator() ]),
    //   descricaoAcaoSecundaria: this._nnfb.control(membro?.descricaoAcaoSecundaria ?? null, [ Validators.required, noWhitespaceValidator() ]),
    //   valorEstimadoAcaoPrincipal: this._nnfb.control(membro?.valorEstimadoAcaoPrincipal ?? 0, Validators.required),
    //   idStatus: this._nnfb.control(membro?.idStatus ?? TipoStatusEnum.Ativo, Validators.required
    //   ),
    // });

    return this._nnfb.group<AcaoFormType>({

      idAcao: this._nnfb.control(membro?.idAcao ?? 0),

      descricaoAcaoPrincipal: this._nnfb.control(
        membro?.descricaoAcaoPrincipal ?? null
      ),

      descricaoAcaoSecundaria: this._nnfb.control(
        membro?.descricaoAcaoSecundaria ?? null
      ),

      valorEstimadoAcaoPrincipal: this._nnfb.control(
        membro?.valorEstimadoAcaoPrincipal ?? 0
      ),

      idStatus: this._nnfb.control(
        membro?.idStatus ?? TipoStatusEnum.Ativo
      ),

      rateio: this.rateioService.construirRateioFormArray(
        membro?.rateio
      )

    });

  }


  public incluirAcao(
    acaoFormGroup: FormGroup<AcaoFormType>
  ): void {
    this.acoesFormArray.push(acaoFormGroup);
  }

  public removerAcao(index: number): void {
    this.acoesFormArray.removeAt(index);
  }

  public construirExcluirAcaoForm(): FormGroup {
    const excluirAcaoForm = this._nnfb.group({
      membroStatus: this._nnfb.control(null, Validators.required),
    });
    this.excluirMembroForm = excluirAcaoForm;
    return this.excluirMembroForm;
  }

  public calcularTotalAcoesAtivas(): number {

    return this.acoesFormArray.controls
      .filter(formGroup =>
        formGroup.controls.idStatus.value === TipoStatusEnum.Ativo
      )
      .reduce((total, formGroup) => {
        return total + (formGroup.controls.valorEstimadoAcaoPrincipal.value ?? 0);
      }, 0);

  }

  public validarAcoes(
    quantiaFormControlValue: number | null
  ): void {
    const acoesFormArrayErrors = this.acoesFormArray.errors;
    const limiteAcoesError = limiteAcoesValidator(
      quantiaFormControlValue,
      this);
    const resultErrors =
      limiteAcoesError != null
        ? { ...acoesFormArrayErrors, ...limiteAcoesError }
        : acoesFormArrayErrors;
    this.acoesWarnings['limiteAcoes'] = !!limiteAcoesError;
    // this.acoesFormArray.setErrors(resultErrors);
  }

  public construirAcoesRateioFormArray(
    acoes?: Array<IAcao>
  ): FormArray<FormGroup<AcaoFormType>> {

    const acoesFormArray = this._nnfb.array<FormGroup<AcaoFormType>>(
      [],
      [Validators.required, Validators.minLength(1),]);

    if (acoes) {
      acoes.forEach((acao) => {
        acoesFormArray.push(this.construirAcaoFormGroup(acao));
      });
    }

    this.acoesFormArray = acoesFormArray;
    this.acoesFormArraySnapshot = this.acoesFormArray.value as Array<IAcao>;

    return this.acoesFormArray;

  }

}
