import { Injectable } from '@angular/core';
import {
  FormArray,
  FormGroup,
  NonNullableFormBuilder,
  Validators,
} from '@angular/forms';

import { debounceTime, merge, Subject } from 'rxjs';

import { ILocalidadeOpcoesDropdown } from '../../interfaces/opcoes-dropdown.interface';

import { RateioModel } from '../../models/rateio.model';

import {
  RateioLocalidadeFormType,
  RateioLocalidadeFormTypeValue,
} from '../../types/form/rateio-form.type';

import { RateioCalculoHelper } from '../../helpers/rateio-calculo.helper';
import { limiteRateioValidator } from '../../validators/rateio.validator';

import { TEMPO_INPUT_USUARIO, TEMPO_RECALCULO } from '../../utils/constants';
import { getSimboloMoeda } from '../../utils/functions';

export interface ILocalidadeCheckboxChange {
  idLocalidade: number;
  checkboxValue: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class RateioService {
  public rateioFormArray: FormArray<FormGroup<RateioLocalidadeFormType>> =
    new FormArray<FormGroup<RateioLocalidadeFormType>>([]);

  private _localidadesOpcoes: Array<ILocalidadeOpcoesDropdown> = [];

  public get localidadesOpcoes(): Array<ILocalidadeOpcoesDropdown> {
    return this._localidadesOpcoes;
  }

  public set localidadesOpcoes(
    localidadesOpcoes: Array<ILocalidadeOpcoesDropdown>
  ) {
    this._localidadesOpcoes = localidadesOpcoes;
    this.controleLocalidadesCheckboxObj =
      this.mapearControleLocalidadesCheckboxObj(localidadesOpcoes);
  }

  private _controleLocalidadesCheckboxObj: Record<number, boolean> = {};

  private set controleLocalidadesCheckboxObj(
    controleLocalidadesCheckboxObj: Record<number, boolean>
  ) {
    this._controleLocalidadesCheckboxObj = controleLocalidadesCheckboxObj;
  }

  private _microrregiaoBooleanCheckboxChange$: Subject<ILocalidadeCheckboxChange> =
    new Subject<ILocalidadeCheckboxChange>();

  public get microrregiaoBooleanCheckboxChange$(): Subject<ILocalidadeCheckboxChange> {
    return this._microrregiaoBooleanCheckboxChange$;
  }

  private _municipioBooleanCheckboxChange$: Subject<ILocalidadeCheckboxChange> =
    new Subject<ILocalidadeCheckboxChange>();

  public get municipioBooleanCheckboxChange$(): Subject<ILocalidadeCheckboxChange> {
    return this._municipioBooleanCheckboxChange$;
  }

  private _simboloMoeda: string = '';

  public get simboloMoeda(): string {
    return this._simboloMoeda;
  }

  private set simboloMoeda(simboloMoeda: string) {
    this._simboloMoeda = simboloMoeda;
  }

  private _moedaFormControlReferencia$: Subject<string | null> = new Subject<
    string | null
  >();

  public get moedaFormControlReferencia$(): Subject<string | null> {
    return this._moedaFormControlReferencia$;
  }

  private _quantiaFormControlReferencia: number | null = null;

  public get quantiaFormControlReferencia(): number | null {
    return this._quantiaFormControlReferencia;
  }

  private set quantiaFormControlReferencia(quantia: number | null) {
    this._quantiaFormControlReferencia = quantia;
  }

  private _quantiaFormControlReferencia$: Subject<number | null> = new Subject<
    number | null
  >();

  public get quantiaFormControlReferencia$(): Subject<number | null> {
    return this._quantiaFormControlReferencia$;
  }

  private _totalRateio: { percentual: number; quantia: number } = {
    percentual: 0,
    quantia: 0,
  };

  public get totalRateio(): { percentual: number; quantia: number } {
    return this._totalRateio;
  }

  private set totalRateio(totalRateio: {
    percentual: number;
    quantia: number;
  }) {
    this._totalRateio = totalRateio;
  }

  constructor(private readonly _nnfb: NonNullableFormBuilder) {
    this.moedaFormControlReferencia$
      .pipe(debounceTime(TEMPO_INPUT_USUARIO))
      .subscribe((moedaValue) => {
        this.simboloMoeda = getSimboloMoeda(moedaValue);
      });

    this.quantiaFormControlReferencia$
      .pipe(debounceTime(TEMPO_INPUT_USUARIO))
      .subscribe((quantiaValue) => {
        this.quantiaFormControlReferencia = quantiaValue;

        if (this.quantiaFormControlReferencia != null)
          this.recalcularRateioPorPercentual();

        this.validarRateio(quantiaValue, this.rateioFormArray.value);
      });

    merge(
      this.microrregiaoBooleanCheckboxChange$,
      this.municipioBooleanCheckboxChange$
    ).subscribe((localidadeCheckboxChange) => {
      this._controleLocalidadesCheckboxObj[
        localidadeCheckboxChange.idLocalidade
      ] = localidadeCheckboxChange.checkboxValue;
    });
  }

  public filtrarLocalidadesPorTipoMicrorregiao(): Array<ILocalidadeOpcoesDropdown> {
    return this.localidadesOpcoes.filter(
      (localidade) => localidade.tipo === 'Microrregiao'
    );
  }

  public filtrarLocalidadesPorTipoMunicipioEIdMicrorregiao(
    idMicrorregiao: number
  ): Array<ILocalidadeOpcoesDropdown> {
    return this.localidadesOpcoes.filter(
      (localidade) =>
        localidade.tipo === 'Municipio' &&
        localidade.idLocalidadePai === idMicrorregiao
    );
  }

  public construirRateioFormArray(
    rateioModelArray?: Array<RateioModel>
  ): FormArray<FormGroup<RateioLocalidadeFormType>> {
    const rateioFormArray = this._nnfb.array<
      FormGroup<RateioLocalidadeFormType>
    >([], [Validators.required, Validators.minLength(1)]);

    if (rateioModelArray) {
      rateioModelArray.forEach((rateioModel) => {
        rateioFormArray.push(
          this.construirRateioLocalidadeFormGroupPorRateioModel(rateioModel)
        );
      });
    }

    this.rateioFormArray = rateioFormArray;

    this.rateioFormArrayValueChanges();

    return this.rateioFormArray;
  }

  public construirRateioLocalidadeFormGroupPorRateioModel(
    rateioModel: RateioModel
  ): FormGroup<RateioLocalidadeFormType> {
    return this._nnfb.group<RateioLocalidadeFormType>({
      idLocalidade: this._nnfb.control(
        rateioModel.idLocalidade,
        Validators.required
      ),
      percentual: this._nnfb.control(rateioModel.percentual, [
        Validators.required,
        Validators.min(1),
      ]),
      quantia: this._nnfb.control(rateioModel.quantia, [
        Validators.required,
        Validators.min(1),
      ]),
    });
  }

  public construirRateioLocalidadeFormGroupPorIdLocalidade(
    idLocalidade: number
  ): FormGroup<RateioLocalidadeFormType> {
    return this._nnfb.group<RateioLocalidadeFormType>({
      idLocalidade: this._nnfb.control(idLocalidade, Validators.required),
      percentual: this._nnfb.control(null, [
        Validators.required,
        Validators.min(1),
      ]),
      quantia: this._nnfb.control(null, [
        Validators.required,
        Validators.min(1),
      ]),
    });
  }

  public buscarIndiceControleRateioLocalidadeFormGroup(
    idLocalidade: number
  ): number {
    return this.rateioFormArray.controls.findIndex(
      (rateioLocalidadeFormGroup) =>
        rateioLocalidadeFormGroup.controls.idLocalidade.value === idLocalidade
    );
  }

  public incluirLocalidadeNoRateio(
    rateioLocalidadeFormGroup: FormGroup<RateioLocalidadeFormType>
  ): void {
    this.rateioFormArray.push(rateioLocalidadeFormGroup);
  }

  public removerLocalidadeDoRateio(idLocalidade: number): void {
    const controlIndex =
      this.buscarIndiceControleRateioLocalidadeFormGroup(idLocalidade);
    this.rateioFormArray.removeAt(controlIndex);
  }

  // Verifica se os valores dos checkboxes de todos os municípios daquela microrregiãoo são true
  public checarValorCheckboxPorMicrorregiao(
    localidadeCheckboxChange: ILocalidadeCheckboxChange,
    idMicrorregiao: number
  ): boolean | null {
    const municipiosDaMicrorregiao =
      this.filtrarLocalidadesPorTipoMunicipioEIdMicrorregiao(idMicrorregiao);

    if (
      !municipiosDaMicrorregiao.some(
        (municipio) => municipio.id === localidadeCheckboxChange.idLocalidade
      )
    )
      return null;

    return municipiosDaMicrorregiao
      .map((municipio) => this._controleLocalidadesCheckboxObj[municipio.id])
      .some((checkboxValue) => checkboxValue);
  }

  // Verifica se o valor do checkbox da microrregião pai do município é true
  public checarValorCheckboxPorMunicipio(
    localidadeCheckboxChange: ILocalidadeCheckboxChange,
    idLocalidadePai: number
  ): boolean | null {
    if (localidadeCheckboxChange.idLocalidade !== idLocalidadePai) return null;

    return this._controleLocalidadesCheckboxObj[idLocalidadePai];
  }

  // Verifica o valor do checkbox da localidade diretamente
  public checarValorCheckboxLocalidade(idLocalidade: number): boolean {
    return this._controleLocalidadesCheckboxObj[idLocalidade];
  }

  public calcularQuantiaPorPercentual(
    percentual: number | null
  ): number | null {
    if (!this.quantiaFormControlReferencia || !percentual) {
      return null;
    }

    return RateioCalculoHelper.calcularQuantiaPorPercentual(
      this.quantiaFormControlReferencia,
      percentual
    );
  }

  public calcularPercentualPorQuantia(quantia: number | null): number | null {
    if (!this.quantiaFormControlReferencia || !quantia) {
      return null;
    }

    return RateioCalculoHelper.calcularPercentualPorQuantia(
      this.quantiaFormControlReferencia,
      quantia
    );
  }

  public resetarRateio(): void {
    this.rateioFormArray.clear();
    this.quantiaFormControlReferencia = null;
    this.simboloMoeda = '';
    this.totalRateio = {
      percentual: 0,
      quantia: 0,
    };
  }

  public alterarVisibilidadeElementoForm(
    rateioLocalidadeFormGroup: FormGroup<RateioLocalidadeFormType>,
    isModoEdicao: boolean
  ): string {
    const isPercentualValueNotNull =
      !!rateioLocalidadeFormGroup.value.percentual;

    const isQuantiaValueNotNull = !!rateioLocalidadeFormGroup.value.quantia;

    const isFormGroupEnabled = rateioLocalidadeFormGroup.enabled;

    const check =
      (!isModoEdicao && isPercentualValueNotNull && isQuantiaValueNotNull) ||
      isFormGroupEnabled;

    return check ? 'visible' : 'invisible';
  }

  private mapearControleLocalidadesCheckboxObj(
    localidadesOpcoes: Array<ILocalidadeOpcoesDropdown>
  ): Record<number, boolean> {
    let controleLocalidadesCheckboxObj: Record<number, boolean> = {};

    localidadesOpcoes.forEach((localidade) => {
      Object.defineProperty(controleLocalidadesCheckboxObj, localidade.id, {
        value: false,
        writable: true,
        enumerable: true,
        configurable: true,
      });
    });

    return controleLocalidadesCheckboxObj;
  }

  private recalcularRateioPorPercentual(): void {
    const rateioFormArrayNovosValores = this.rateioFormArray.value.map(
      (rateioLocalidadeValue) => {
        return {
          idLocalidade: rateioLocalidadeValue.idLocalidade,
          percentual: rateioLocalidadeValue.percentual,
          quantia: this.calcularQuantiaPorPercentual(
            rateioLocalidadeValue.percentual || null
          ),
        };
      }
    );

    this.rateioFormArray.patchValue(rateioFormArrayNovosValores);
  }

  private rateioFormArrayValueChanges(): void {
    this.rateioFormArray.valueChanges
      .pipe(debounceTime(TEMPO_RECALCULO))
      .subscribe((rateioFormArrayValue) => {
        this.calcularTotalRateio(rateioFormArrayValue);

        this.validarRateio(
          this.quantiaFormControlReferencia,
          rateioFormArrayValue
        );
      });
  }

  private calcularTotalRateio(
    rateioFormArrayValue: Array<RateioLocalidadeFormTypeValue>
  ): void {
    const [totalPercentual, totalQuantia] =
      RateioCalculoHelper.calcularTotalRateio(rateioFormArrayValue);

    this.totalRateio = {
      percentual: totalPercentual,
      quantia: totalQuantia,
    };
  }

  private validarRateio(
    quantiaFormControlValue: number | null,
    rateioFormArrayValue: Array<RateioLocalidadeFormTypeValue>
  ): void {
    const rateioFormArrayErrors = this.rateioFormArray.errors;

    const limiteRateioError = limiteRateioValidator(
      quantiaFormControlValue,
      rateioFormArrayValue
    );

    const resultErrors =
      limiteRateioError != null
        ? { ...rateioFormArrayErrors, ...limiteRateioError }
        : rateioFormArrayErrors;

    this.rateioFormArray.setErrors(resultErrors);
  }
}
