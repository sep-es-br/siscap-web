import { Injectable } from '@angular/core';
import {
  FormArray,
  FormGroup,
  NonNullableFormBuilder,
  Validators,
} from '@angular/forms';

import { debounceTime, Subject } from 'rxjs';

import {
  RateioCidadeFormType,
  RateioCidadeFormTypeValue,
  RateioMicrorregiaoFormType,
  RateioMicrorregiaoFormTypeValue,
} from '../../types/form/rateio-form.type';

import {
  IRateio,
  IRateioCidade,
  IRateioMicrorregiao,
} from '../../interfaces/rateio.interface';

import { RateioCalculoHelper } from '../../helpers/rateio-calculo.helper';

import { TEMPO_INPUT_USUARIO, TEMPO_RECALCULO } from '../../utils/constants';

export interface ICidadeCheckboxChange {
  idCidade: number;
  checkboxValue: boolean;
  idMicrorregiaoPai: number;
}

@Injectable({
  providedIn: 'root',
})
export class RateioService {
  public rateioMicrorregiaoFormArray: FormArray<
    FormGroup<RateioMicrorregiaoFormType>
  > = new FormArray<FormGroup<RateioMicrorregiaoFormType>>([]);

  public rateioCidadeFormArray: FormArray<FormGroup<RateioCidadeFormType>> =
    new FormArray<FormGroup<RateioCidadeFormType>>([]);

  private get _rateioMicrorregiaoControls(): Array<
    FormGroup<RateioMicrorregiaoFormType>
  > {
    return this.rateioMicrorregiaoFormArray.controls;
  }

  private get _rateioMicrorregiaoValue(): Array<RateioMicrorregiaoFormTypeValue> {
    return this.rateioMicrorregiaoFormArray.value;
  }

  private get _rateioCidadeControls(): Array<FormGroup<RateioCidadeFormType>> {
    return this.rateioCidadeFormArray.controls;
  }

  private get _rateioCidadeValue(): Array<RateioCidadeFormTypeValue> {
    return this.rateioCidadeFormArray.value;
  }

  private _valorEstimadoReferencia: number | null = null;

  public get valorEstimadoReferencia(): number | null {
    return this._valorEstimadoReferencia;
  }

  private set valorEstimadoReferencia(valorEstimado: number | null) {
    this._valorEstimadoReferencia = valorEstimado;
  }

  private _valorEstimadoReferencia$: Subject<number | null> = new Subject<
    number | null
  >();

  public get valorEstimadoReferencia$(): Subject<number | null> {
    return this._valorEstimadoReferencia$;
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

  private _microrregioesCidadesMapObject: Record<number, Array<number>> = {};

  public set microrregioesCidadesMapObject(
    microrregioesCidadesMapObject: Record<number, Array<number>>
  ) {
    this._microrregioesCidadesMapObject = microrregioesCidadesMapObject;
  }

  private _cidadeCheckboxChange$: Subject<ICidadeCheckboxChange> =
    new Subject<ICidadeCheckboxChange>();

  public get cidadeCheckboxChange$(): Subject<ICidadeCheckboxChange> {
    return this._cidadeCheckboxChange$;
  }

  constructor(private _nnfb: NonNullableFormBuilder) {
    this.valorEstimadoReferencia$
      .pipe(debounceTime(TEMPO_INPUT_USUARIO))
      .subscribe((valorEstimadoValue) => {
        this.valorEstimadoReferencia = valorEstimadoValue;
      });
  }

  public construirRateioMicrorregiaoFormArray(
    rateioMicrorregiao?: Array<IRateioMicrorregiao>
  ): FormArray<FormGroup<RateioMicrorregiaoFormType>> {
    const rateioMicrorregiaoFormArray = this._nnfb.array<
      FormGroup<RateioMicrorregiaoFormType>
    >([], [Validators.required, Validators.minLength(1)]);

    if (rateioMicrorregiao) {
      rateioMicrorregiao.forEach((microrregiao) => {
        rateioMicrorregiaoFormArray.push(
          this.construirRateioMicrorregiaoFormGroup(microrregiao)
        );
      });
    }

    this.rateioMicrorregiaoFormArray = rateioMicrorregiaoFormArray;

    this.rateioMicrorregiaoFormArrayValueChanges$();

    return this.rateioMicrorregiaoFormArray;
  }

  public construirRateioCidadeFormArray(
    rateioCidade?: Array<IRateioCidade>
  ): FormArray<FormGroup<RateioCidadeFormType>> {
    const rateioCidadeFormArray = this._nnfb.array<
      FormGroup<RateioCidadeFormType>
    >([], [Validators.required, Validators.minLength(1)]);

    if (rateioCidade) {
      rateioCidade.forEach((cidade) => {
        rateioCidadeFormArray.push(this.construirRateioCidadeFormGroup(cidade));
      });
    }

    this.rateioCidadeFormArray = rateioCidadeFormArray;

    this.rateioCidadeFormArrayValueChanges$();

    return this.rateioCidadeFormArray;
  }

  public construirRateioMicrorregiaoFormGroup(
    microrregiao?: IRateioMicrorregiao
  ): FormGroup<RateioMicrorregiaoFormType> {
    return this._nnfb.group<RateioMicrorregiaoFormType>({
      idMicrorregiao: this._nnfb.control(
        microrregiao?.idMicrorregiao ?? 0,
        Validators.required
      ),
      percentual: this._nnfb.control(microrregiao?.percentual ?? null, [
        Validators.required,
        Validators.min(1),
      ]),
      quantia: this._nnfb.control(microrregiao?.quantia ?? null, [
        Validators.required,
        Validators.min(1),
      ]),
    });
  }

  public construirRateioMicrorregiaoFormGroupSelectList(
    idMicrorregiao: number
  ): FormGroup<RateioMicrorregiaoFormType> {
    const rateioMicrorregiaoFormGroup =
      this.construirRateioMicrorregiaoFormGroup();
    rateioMicrorregiaoFormGroup.patchValue({ idMicrorregiao });
    return rateioMicrorregiaoFormGroup;
  }

  public construirRateioCidadeFormGroup(
    cidade?: IRateioCidade
  ): FormGroup<RateioCidadeFormType> {
    return this._nnfb.group<RateioCidadeFormType>({
      idCidade: this._nnfb.control(cidade?.idCidade ?? 0, Validators.required),
      percentual: this._nnfb.control(cidade?.percentual ?? null, [
        Validators.required,
        Validators.min(1),
      ]),
      quantia: this._nnfb.control(cidade?.quantia ?? null, [
        Validators.required,
        Validators.min(1),
      ]),
    });
  }

  public construirRateioCidadeFormGroupSelectList(
    idCidade: number
  ): FormGroup<RateioCidadeFormType> {
    const rateioCidadeFormGroup = this.construirRateioCidadeFormGroup();
    rateioCidadeFormGroup.patchValue({ idCidade });
    return rateioCidadeFormGroup;
  }

  public incluirMicrorregiaoNoRateio(
    microrregiaoFormGroup: FormGroup<RateioMicrorregiaoFormType>
  ): void {
    this.rateioMicrorregiaoFormArray.push(microrregiaoFormGroup);
  }

  public incluirCidadeNoRateio(
    cidadeFormGroup: FormGroup<RateioCidadeFormType>
  ): void {
    this.rateioCidadeFormArray.push(cidadeFormGroup);
  }

  public removerMicrorregiaoDoRateio(index: number): void {
    this.rateioMicrorregiaoFormArray.removeAt(index);
  }

  public removerCidadeDoRateio(index: number): void {
    this.rateioCidadeFormArray.removeAt(index);
  }

  public calcularQuantiaPorPercentual(
    percentual: number | null
  ): number | null {
    if (!this.valorEstimadoReferencia || !percentual) {
      return null;
    }

    return RateioCalculoHelper.calcularQuantiaPorPercentual(
      this.valorEstimadoReferencia,
      percentual
    );
  }

  public calcularPercentualPorQuantia(quantia: number | null): number | null {
    if (!this.valorEstimadoReferencia || !quantia) {
      return null;
    }

    return RateioCalculoHelper.calcularPercentualPorQuantia(
      this.valorEstimadoReferencia,
      quantia
    );
  }

  public calculoAutomaticoPorMicrorregioes(): void {
    if (!this.valorEstimadoReferencia) {
      return;
    }

    this._rateioMicrorregiaoControls.forEach((rateioMicrorregiaoFormGroup) => {
      const rateioCidadeControls =
        this.filtrarRateioCidadeControlsPorIdMicrorregiao(
          rateioMicrorregiaoFormGroup.controls.idMicrorregiao.value
        );

      const [percentualCidade, quantiaCidade] =
        RateioCalculoHelper.calcularValoresCidadesPorMicrorregiao(
          rateioMicrorregiaoFormGroup,
          rateioCidadeControls.length
        );

      rateioCidadeControls.forEach((rateioCidadeFormGroup) => {
        rateioCidadeFormGroup.controls.percentual.patchValue(percentualCidade);
        rateioCidadeFormGroup.controls.quantia.patchValue(quantiaCidade);
      });
    });

    setTimeout(() => {
      this.recalcularDiferencaRateioPorCidades();
    }, TEMPO_RECALCULO);
  }

  public calculoAutomaticoPorCidades(): void {
    if (!this.valorEstimadoReferencia) {
      return;
    }

    this._rateioMicrorregiaoControls.forEach((rateioMicrorregiaoFormGroup) => {
      const [percentualMicrorregiao, quantiaMicrorregiao] =
        RateioCalculoHelper.calcularValoresMicrorregiaoPorCidades(
          this.filtrarRateioCidadeControlsPorIdMicrorregiao(
            rateioMicrorregiaoFormGroup.controls.idMicrorregiao.value
          )
        );

      rateioMicrorregiaoFormGroup.controls.percentual.patchValue(
        percentualMicrorregiao
      );
      rateioMicrorregiaoFormGroup.controls.quantia.patchValue(
        quantiaMicrorregiao
      );
    });

    // setTimeout(() => {
    //   this.recalcularDiferencaRateioPorMicrorregioes();
    // }, TEMPO_RECALCULO);
  }

  public limparTotalRateio(): void {
    this.totalRateio = {
      percentual: 0,
      quantia: 0,
    };
  }

  public checarConsistenciaMicrorregioesCidades(rateioValue: IRateio): boolean {
    const rateioMicrorregiaoValueIdMap: Array<number> =
      rateioValue.rateioMicrorregiao.map(
        (microrregiao) => microrregiao.idMicrorregiao
      );

    const rateioCidadeValueIdMap: Array<number> = rateioValue.rateioCidade.map(
      (cidade) => cidade.idCidade
    );

    const checkConsistenciaMicrorregioes: boolean =
      rateioMicrorregiaoValueIdMap.every((idMicrorregiao: number) =>
        rateioCidadeValueIdMap.some((idCidade: number) =>
          this._microrregioesCidadesMapObject[idMicrorregiao].includes(idCidade)
        )
      );

    const checkConsistenciaCidades: boolean = rateioCidadeValueIdMap.every(
      (idCidade: number) =>
        rateioMicrorregiaoValueIdMap
          .map(
            (idMicrorregiao: number) =>
              this._microrregioesCidadesMapObject[idMicrorregiao]
          )
          .some((cidadesArray: Array<number>) =>
            cidadesArray.includes(idCidade)
          )
    );

    return checkConsistenciaMicrorregioes && checkConsistenciaCidades;
  }

  private calcularTotalRateio(
    rateioValueArray:
      | Array<RateioMicrorregiaoFormTypeValue>
      | Array<RateioCidadeFormTypeValue>
  ): void {
    const totalRateio =
      RateioCalculoHelper.calcularTotalRateio(rateioValueArray);

    this.totalRateio = {
      percentual: totalRateio[0],
      quantia: totalRateio[1],
    };
  }

  private rateioMicrorregiaoFormArrayValueChanges$(): void {
    this.rateioMicrorregiaoFormArray.valueChanges
      .pipe(debounceTime(TEMPO_RECALCULO))
      .subscribe((rateioMicrorregiaoFormArrayValue) => {
        this.calcularTotalRateio(rateioMicrorregiaoFormArrayValue);
      });
  }

  private rateioCidadeFormArrayValueChanges$(): void {
    this.rateioCidadeFormArray.valueChanges
      .pipe(debounceTime(TEMPO_RECALCULO))
      .subscribe((rateioCidadeFormArrayValue) => {
        this.calcularTotalRateio(rateioCidadeFormArrayValue);
      });
  }

  // private recalcularDiferencaRateioPorMicrorregioes(): void {
  //   if (!this.valorEstimadoReferencia) {
  //     return;
  //   }

  //   const totalRateio = RateioCalculoHelper.calcularTotalRateioPorMicrorregioes(
  //     this._rateioMicrorregiaoValue
  //   );

  //   const diferencaPercentual = 100 - totalRateio[0];
  //   const diferencaQuantia = this.valorEstimadoReferencia - totalRateio[1];

  //   if (diferencaPercentual === 0 && diferencaQuantia === 0) {
  //     return;
  //   }

  //   const rateioMicrorregiaoFormGroupAleatorio =
  //     this._rateioMicrorregiaoControls[
  //       Math.floor(Math.random() * this._rateioMicrorregiaoControls.length)
  //     ];

  //   const percentualRateioMicrorregiaoFormGroupAleatorio =
  //     rateioMicrorregiaoFormGroupAleatorio.controls.percentual;

  //   const quantiaRateioMicrorregiaoFormGroupAleatorio =
  //     rateioMicrorregiaoFormGroupAleatorio.controls.quantia;

  //   percentualRateioMicrorregiaoFormGroupAleatorio.patchValue(
  //     percentualRateioMicrorregiaoFormGroupAleatorio.value! +
  //       diferencaPercentual
  //   );

  //   quantiaRateioMicrorregiaoFormGroupAleatorio.patchValue(
  //     quantiaRateioMicrorregiaoFormGroupAleatorio.value! + diferencaQuantia
  //   );
  // }

  private recalcularDiferencaRateioPorCidades(): void {
    if (!this.valorEstimadoReferencia) {
      return;
    }

    if (this._rateioCidadeControls.length === 0) {
      return;
    }

    const totalRateio = RateioCalculoHelper.calcularTotalRateio(
      this._rateioCidadeValue
    );

    const diferencaPercentual = 100 - totalRateio[0];
    const diferencaQuantia = this.valorEstimadoReferencia - totalRateio[1];

    if (diferencaPercentual === 0 && diferencaQuantia === 0) {
      return;
    }

    const rateioCidadeFormGroupAleatorio =
      this._rateioCidadeControls[
        Math.floor(Math.random() * this._rateioCidadeControls.length)
      ];

    const percentualRateioCidadeFormGroupAleatorio =
      rateioCidadeFormGroupAleatorio.controls.percentual;

    const quantiaRateioCidadeFormGroupAleatorio =
      rateioCidadeFormGroupAleatorio.controls.quantia;

    percentualRateioCidadeFormGroupAleatorio.patchValue(
      percentualRateioCidadeFormGroupAleatorio.value! + diferencaPercentual
    );

    quantiaRateioCidadeFormGroupAleatorio.patchValue(
      quantiaRateioCidadeFormGroupAleatorio.value! + diferencaQuantia
    );
  }

  private filtrarRateioCidadeControlsPorIdMicrorregiao(
    idMicrorregiao: number
  ): Array<FormGroup<RateioCidadeFormType>> {
    return this._rateioCidadeControls.filter((rateioCidadeFormGroup) =>
      this._microrregioesCidadesMapObject[idMicrorregiao].includes(
        rateioCidadeFormGroup.controls.idCidade.value
      )
    );
  }
}
