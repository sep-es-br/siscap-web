import { Injectable } from '@angular/core';
import {
  FormArray,
  FormGroup,
  NonNullableFormBuilder,
  Validators,
} from '@angular/forms';

import { debounceTime, Subject } from 'rxjs';

// import { any } from '../../models/rateio.model';

import { IMicrorregiaoCidadesSelectList } from '../../interfaces/select-list.interface';

import { RateioCalcHelper } from '../../helpers/rateio/rateio-calc.helper';
import { IRateio } from '../../interfaces/rateio.interface';

@Injectable({
  providedIn: 'root',
})
export class OldRateioService {
  private _rateio: FormArray<FormGroup<any>> = new FormArray<
    FormGroup<any>
  >([]);

  public get rateio(): FormArray<FormGroup<any>> {
    return this._rateio;
  }

  private _valorEstimadoReferencia: number = 0;

  public get valorEstimadoReferencia(): number {
    return this._valorEstimadoReferencia;
  }

  private _valorEstimadoReferenciaObs$: Subject<number | null> = new Subject<
    number | null
  >();

  public get valorEstimadoReferenciaObs$(): Subject<number | null> {
    return this._valorEstimadoReferenciaObs$;
  }

  private _microrregioesCidadesList: Array<IMicrorregiaoCidadesSelectList> = [];

  public set microrregioesCidadesList(
    microrregioesCidadesList: Array<IMicrorregiaoCidadesSelectList>
  ) {
    this._microrregioesCidadesList = microrregioesCidadesList;
  }

  private _totalRateio: Array<number> = [0, 0];

  private set totalRateio(totalRateio: Array<number>) {
    this._totalRateio = totalRateio;
  }

  public get totalRateioPercentual(): number {
    return this._totalRateio[0];
  }

  public get totalRateioQuantia(): number {
    return this._totalRateio[1];
  }

  private _calculoAutomaticoObs$: Subject<string> = new Subject<string>();

  public get calculoAutomaticoObs$(): Subject<string> {
    return this._calculoAutomaticoObs$;
  }

  constructor(private _nnfb: NonNullableFormBuilder) {
    this._valorEstimadoReferenciaObs$.subscribe((valorEstimado) => {
      this._valorEstimadoReferencia = valorEstimado ?? 0;
      this.calcularTotalRateio(this.rateio.value);
    });
  }

  public setRateioFormArray(
    targetRateioFormArray: FormArray<FormGroup<any>>
  ): void {
    this._rateio = targetRateioFormArray;

    this._rateio.valueChanges
      .pipe(debounceTime(750))
      .subscribe((rateioValue) => {
        this.calcularTotalRateio(rateioValue);
      });
  }

  public patchRateioFormArray(rateioValue: Array<IRateio>): void {
    rateioValue.forEach((rateioCidade) => {
      const rateioFormGroup = this._nnfb.group<any>(
        // new any(rateioCidade)
        {}
      );
      this.incluirCidadeNoRateio(rateioFormGroup);
    });
  }

  public construirRateioFormGroup(
    idCidade: number
  ): FormGroup<any> {
    return (
      this.rateio.controls.find(
        (control) => control.value.idCidade === idCidade
      ) ??
      this._nnfb.group<any>({
        idCidade: this._nnfb.control(idCidade),
        quantia: this._nnfb.control(
          { value: null, disabled: true },
          { validators: Validators.required }
        ),
      })
    );
  }

  public incluirCidadeNoRateio(cidade: FormGroup<any>): void {
    this.rateio.push(cidade);
  }

  public removerCidadeDoRateio(cidade: FormGroup<any>): void {
    const index = this.rateio.value.findIndex(
      (targetCidade) => targetCidade.idCidade === cidade.value.idCidade
    );

    this.rateio.removeAt(index);
  }

  public calcularPercentualPorQuantia(quantia: number | null): number | null {
    if (!quantia) {
      return null;
    }

    return RateioCalcHelper.calcularPercentualPorQuantia(
      quantia,
      this.valorEstimadoReferencia
    );
  }

  public calcularValoresMicrorregiaoAutomatico(
    microrregiaoId: number
  ): number | null {
    const rateioFormArrayValueFiltrado =
      this.filtrarCidadesRateioPorMicrorregiaoId(microrregiaoId);

    if (rateioFormArrayValueFiltrado.length == 0) {
      return null;
    }

    return RateioCalcHelper.calcularValoresMicrorregiaoAutomatico(
      rateioFormArrayValueFiltrado
    );
  }

  public calcularValoresCidadeAutomatico(
    microrregiaoId: number,
    microrregiaoQuantiaRateio: number | null
  ): number | null {
    const rateioFormArrayValueFiltrado =
      this.filtrarCidadesRateioPorMicrorregiaoId(microrregiaoId);

    if (
      !microrregiaoQuantiaRateio ||
      rateioFormArrayValueFiltrado.length == 0
    ) {
      return null;
    }

    return RateioCalcHelper.calcularValoresCidadeAutomatico(
      rateioFormArrayValueFiltrado,
      microrregiaoQuantiaRateio
    );
  }

  private filtrarCidadesRateioPorMicrorregiaoId(
    microrregiaoId: number
  ): Array<any> {
    const cidadesIdList = this._microrregioesCidadesList
      .find((microrregiao) => microrregiao.id == microrregiaoId)
      ?.cidades.map((cidade) => cidade.id);

    return this.rateio.value.filter((rateioCidade) =>
      cidadesIdList?.includes(rateioCidade.idCidade!)
    );
  }

  private calcularTotalRateio(rateioFormArrayValue: Array<any>): void {
    this.totalRateio = RateioCalcHelper.calcularTotalRateio(
      rateioFormArrayValue,
      this.valorEstimadoReferencia
    );
  }
}
