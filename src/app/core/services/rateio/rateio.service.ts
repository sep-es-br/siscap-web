import { Injectable } from '@angular/core';
import {
  FormArray,
  FormGroup,
  NonNullableFormBuilder,
  Validators,
} from '@angular/forms';

import { debounceTime, merge, ReplaySubject, Subject, Subscription, tap } from 'rxjs';

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
import { TipoDistribuicaoRateio } from '../../enums/tipo-distribuicao-rateio.enum';

export interface ILocalidadeCheckboxChange {
  idLocalidade: number;
  checkboxValue: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class RateioService {

  private static contadorInstancias = 0;

  public readonly instanciaId =
    ++RateioService.contadorInstancias;

  public rateioFormArray: FormArray<FormGroup<RateioLocalidadeFormType>> =
    new FormArray<FormGroup<RateioLocalidadeFormType>>([]);

  private rateioFormArraySnapshot: Array<RateioLocalidadeFormTypeValue> = [];

  private _localidadesOpcoes: Array<ILocalidadeOpcoesDropdown> = [];

  private rateioFormArraySubscription?: Subscription;

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
    controleLocalidadesCheckboxObj: Record<number, boolean>) {
    this._controleLocalidadesCheckboxObj = controleLocalidadesCheckboxObj;
  }

  private _estadoBooleanCheckboxChange$: Subject<boolean> =
    new Subject<boolean>();

  public _distribuicaoLinearCheckboxChange$ =
    new Subject<boolean>();

  public get estadoBooleanCheckboxChange$(): Subject<boolean> {
    return this._estadoBooleanCheckboxChange$;
  }

  public get distribuicaoLinearCheckboxChange$(): Subject<boolean> {
    return this._distribuicaoLinearCheckboxChange$;
  }

  private _estadoBooleanCheckboxReferencia: boolean = false;

  private _tipoDistribuicaoReferencia: TipoDistribuicaoRateio =
    TipoDistribuicaoRateio.Manual;

  public get tipoDistribuicaoReferencia(): TipoDistribuicaoRateio {
    return this._tipoDistribuicaoReferencia;
  }

  private _tipoDistribuicaoChange$ =
    new Subject<TipoDistribuicaoRateio>();

  public get tipoDistribuicaoChange$(): Subject<TipoDistribuicaoRateio> {
    return this._tipoDistribuicaoChange$;
  }

  public get estadoBooleanCheckboxReferencia(): boolean {
    return this._estadoBooleanCheckboxReferencia;
  }

  private set estadoBooleanCheckboxReferencia(estadoBooleanCheckbox: boolean) {
    this._estadoBooleanCheckboxReferencia = estadoBooleanCheckbox;
  }

  private set distribuicaoLinearCheckboxReferencia(distribuicaoLinearCheckbox: boolean) {
    this._distribuicaoLinearCheckboxReferencia = distribuicaoLinearCheckbox;
  }

  private _distribuicaoLinearCheckboxReferencia: boolean = false;

  public get distribuicaoLinearCheckboxReferencia(): boolean {
    return this._distribuicaoLinearCheckboxReferencia;
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

  private _quantiaFormControlReferencia$: Subject<number | null> = new Subject<number | null>();

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

  public rateioRecalculado$ =
    new ReplaySubject<void>(1);

  constructor(private readonly _nnfb: NonNullableFormBuilder) {

    this.moedaFormControlReferencia$
      .pipe(debounceTime(TEMPO_INPUT_USUARIO))
      .subscribe((moedaValue) => {
        this.simboloMoeda = getSimboloMoeda(moedaValue);
      });

    this.quantiaFormControlReferencia$
      .pipe(
        tap((quantiaValue) => {
          this.quantiaFormControlReferencia = quantiaValue;
        }),
        debounceTime(TEMPO_INPUT_USUARIO)
      )
      .subscribe((quantiaValue) => {

        if (quantiaValue != null) {

          if (this.tipoDistribuicaoReferencia === TipoDistribuicaoRateio.Linear) {
            this.distribuirRateioLinearmente();
          } else {
            this.recalcularRateioPorPercentual();
          }
        }

        this.validarRateio(
          quantiaValue,
          this.rateioFormArray.value
        );

      });

    merge(
      this.microrregiaoBooleanCheckboxChange$,
      this.municipioBooleanCheckboxChange$

    ).subscribe((localidadeCheckboxChange) => {
      this._controleLocalidadesCheckboxObj[
        localidadeCheckboxChange.idLocalidade
      ] = localidadeCheckboxChange.checkboxValue;
    });

    this.estadoBooleanCheckboxChange$.subscribe((estadoCheckboxChange) => {

      this.estadoBooleanCheckboxReferencia = estadoCheckboxChange;

      estadoCheckboxChange
        ? this.incluirEstadoNoRateio()
        : this.removerEstadoDoRateio();

    });

    // this.distribuicaoLinearCheckboxChange$
    //   .subscribe((distribuicaoLinearCheckboxChange) => {
    //     this.distribuicaoLinearCheckboxReferencia = distribuicaoLinearCheckboxChange;
    //     distribuicaoLinearCheckboxChange
    //       ? this.distribuirRateioLinearmente()
    //       : this.recalcularRateioPorPercentual();
    //   });

    this.distribuicaoLinearCheckboxChange$
      .subscribe((distribuicaoLinear) => {

        this.alterarTipoDistribuicao(
          distribuicaoLinear
        );

        if (distribuicaoLinear) {
          this.distribuirRateioLinearmente();
        }

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

  public construirRateioFormArray(rateioModelArray?: Array<RateioModel>):
    FormArray<FormGroup<RateioLocalidadeFormType>> {

    const rateioFormArray =
      this._nnfb.array<FormGroup<RateioLocalidadeFormType>>(
        [],
        [Validators.required, Validators.minLength(1)]
      );

    rateioModelArray?.forEach(rateioModel => {
      rateioFormArray.push(
        this.construirRateioLocalidadeFormGroupPorRateioModel(
          rateioModel
        )
      );
    });

    return rateioFormArray;

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

  public incluirLocalidadeNoRateio(rateioLocalidadeFormGroup: FormGroup<RateioLocalidadeFormType>): void {

    this.rateioFormArray.push(rateioLocalidadeFormGroup);

    this.recalcularSeDistribuicaoLinear();

  }

  public removerLocalidadeDoRateio(
    idLocalidade: number
  ): void {

    const controlIndex =
      this.buscarIndiceControleRateioLocalidadeFormGroup(
        idLocalidade
      );

    if (controlIndex < 0) {
      return;
    }

    this.rateioFormArray.removeAt(controlIndex);

    this.recalcularSeDistribuicaoLinear();

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

  private incluirEstadoNoRateio(): void {

    const isEstadoInclusoNoRateio =
      this.rateioFormArray.value.some(
        rateio => rateio.idLocalidade == 1
      );

    if (isEstadoInclusoNoRateio) return;

    this.rateioFormArraySnapshot =
      this.rateioFormArray.getRawValue();

    const estadoFormGroup =
      this.construirRateioLocalidadeFormGroupPorIdLocalidade(1);

    estadoFormGroup.controls.quantia.setValue(
      this.quantiaFormControlReferencia
    );

    estadoFormGroup.controls.percentual.setValue(100);

    if (this.rateioFormArray.length > 0) {
      this.rateioFormArray.clear();
    }

    this.incluirLocalidadeNoRateio(estadoFormGroup);

  }

  private removerEstadoDoRateio(): void {

    const isEstadoInclusoNoRateio = this.rateioFormArray.value.some(
      (rateioLocalidadeValue) => rateioLocalidadeValue.idLocalidade == 1);

    if (!isEstadoInclusoNoRateio) return;

    this.removerLocalidadeDoRateio(1);

    this.restaurarRateioFormArraySnapshot();

  }

  private restaurarRateioFormArraySnapshot(): void {
    if (this.rateioFormArraySnapshot.length == 0) return;
    if (this.rateioFormArraySnapshot[0].idLocalidade == 1) return;

    this.rateioFormArraySnapshot.forEach((rateioLocalidadeValue) => {
      const rateioFormGroup =
        this.construirRateioLocalidadeFormGroupPorIdLocalidade(
          rateioLocalidadeValue.idLocalidade!
        );

      rateioFormGroup.controls.percentual.setValue(
        rateioLocalidadeValue.percentual!
      );
      rateioFormGroup.controls.quantia.setValue(rateioLocalidadeValue.quantia!);

      this.rateioFormArray.push(rateioFormGroup);
    });
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

    this.rateioFormArraySubscription?.unsubscribe();

    this.rateioFormArraySubscription =
      this.rateioFormArray.valueChanges
        .pipe(
          debounceTime(TEMPO_RECALCULO)
        )
        .subscribe((rateioFormArrayValue) => {

          this.calcularTotalRateio(
            rateioFormArrayValue
          );

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

  public limparCheckboxesFilhos(): void {

    this.microrregiaoBooleanCheckboxChange$.next(
      {
        idLocalidade: 0,
        checkboxValue: false
      });

    this.municipioBooleanCheckboxChange$.next({
      idLocalidade: 0,
      checkboxValue: false
    });

  }

  public limparTotalRateio() {
    this.totalRateio = { percentual: 0, quantia: 0 };
  }

  private distribuirRateioLinearmente(): void {

    const quantiaTotal =
      Number(this.quantiaFormControlReferencia);

    if (
      !Number.isFinite(quantiaTotal) ||
      quantiaTotal <= 0
    ) {
      return;
    }

    if (this.estadoBooleanCheckboxReferencia) {
      this.preencherRateioComTodosMunicipios();
    }

    const localidades =
      this.rateioFormArray.controls.filter(
        control =>
          control.controls.idLocalidade.value !== 1
      );

    const quantidadeLocalidades =
      localidades.length;

    if (quantidadeLocalidades === 0) {
      return;
    }

    /*
     * Trabalhamos em centavos para evitar
     * problemas de ponto flutuante.
     */
    const quantiaTotalCentavos =
      Math.round(quantiaTotal * 100);

    const percentualTotalCentavos = 10000; // 100,00%

    /*
     * Valor padrão para todas as localidades,
     * exceto a última.
     */
    const quantiaBaseCentavos =
      Math.round(
        quantiaTotalCentavos /
        quantidadeLocalidades
      );

    const percentualBaseCentavos =
      Math.round(
        percentualTotalCentavos /
        quantidadeLocalidades
      );

    let quantiaDistribuidaCentavos = 0;
    let percentualDistribuidoCentavos = 0;

    localidades.forEach((control, index) => {

      const isUltimaLocalidade =
        index === quantidadeLocalidades - 1;

      let quantiaLocalidadeCentavos: number;
      let percentualLocalidadeCentavos: number;

      if (isUltimaLocalidade) {

        /*
         * A última localidade recebe exatamente
         * o restante necessário para fechar o total.
         */
        quantiaLocalidadeCentavos =
          quantiaTotalCentavos -
          quantiaDistribuidaCentavos;

        percentualLocalidadeCentavos =
          percentualTotalCentavos -
          percentualDistribuidoCentavos;

      } else {

        quantiaLocalidadeCentavos =
          quantiaBaseCentavos;

        percentualLocalidadeCentavos =
          percentualBaseCentavos;
      }

      const quantiaLocalidade =
        quantiaLocalidadeCentavos / 100;

      const percentualLocalidade =
        percentualLocalidadeCentavos / 100;

      control.patchValue(
        {
          quantia: quantiaLocalidade,
          percentual: percentualLocalidade
        },
        {
          emitEvent: false
        }
      );

      quantiaDistribuidaCentavos +=
        quantiaLocalidadeCentavos;

      percentualDistribuidoCentavos +=
        percentualLocalidadeCentavos;
    });

    const rateioAtual =
      this.rateioFormArray.getRawValue();

    this.calcularTotalRateio(rateioAtual);

    this.validarRateio(
      this.quantiaFormControlReferencia,
      rateioAtual
    );

    this.rateioRecalculado$.next();

  }

  public vincularRateioFormArray(
    rateioFormArray: FormArray<FormGroup<RateioLocalidadeFormType>>
  ): void {

    this.rateioFormArray = rateioFormArray;

    this.rateioFormArraySnapshot =
      this.rateioFormArray.getRawValue();

    this.rateioFormArrayValueChanges();

    this.calcularTotalRateio(
      this.rateioFormArray.getRawValue()
    );

  }

  private preencherRateioComTodosMunicipios(): void {

    const municipios =
      this.localidadesOpcoes.filter(
        localidade =>
          localidade.tipo === 'Municipio'
      );

    console.log(
      '>>> municípios do Estado:',
      municipios.length
    );

    /*
     * Remove o que estiver atualmente no rateio.
     *
     * Inclusive aquele registro do Estado id = 1.
     */
    this.rateioFormArray.clear({
      emitEvent: false
    });

    municipios.forEach(municipio => {

      const municipioFormGroup =
        this.construirRateioLocalidadeFormGroupPorIdLocalidade(
          municipio.id
        );

      this.rateioFormArray.push(
        municipioFormGroup,
        {
          emitEvent: false
        }
      );

    });

  }

  private alterarTipoDistribuicao(
    distribuicaoLinear: boolean
  ): void {

    this.distribuicaoLinearCheckboxReferencia =
      distribuicaoLinear;

    this._tipoDistribuicaoReferencia =
      distribuicaoLinear
        ? TipoDistribuicaoRateio.Linear
        : TipoDistribuicaoRateio.Manual;

    this.tipoDistribuicaoChange$.next(
      this._tipoDistribuicaoReferencia
    );

  }

  private recalcularSeDistribuicaoLinear(): void {

    if (this.tipoDistribuicaoReferencia !== TipoDistribuicaoRateio.Linear
    ) {
      return;
    }

    this.distribuirRateioLinearmente();

  }

}
