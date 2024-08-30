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
  IRateioCidade,
  IRateioMicrorregiao,
} from '../../interfaces/rateio.interface';

import { RateioCalculoHelper } from '../../helpers/rateio/rateio-calculo.helper';

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
        // console.log(valorEstimadoValue);
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

    /*
      QUESTÃO VALORES QUEBRADOS

      AO DISTRIBUIR VALORES DA MICRORREGIAO PAI PARA AS CIDADES FILHAS,
      QUANDO A DIVISÃO NÃO FOR EXATA, O PROCESSO INVERSO (CALCULAR TOTAL RATEIO POR CIDADES)
      GERALMENTE RESULTA EM UM PERCENTUAL MENOR QUE O MAXIMO (100%)
      E UMA QUANTIA MAIOR QUE O MAXIMO (valorEstimado)

      ex:
        valorEstimado = R$ 100.000.000,00 (100 MILHÕES)
        3 MICRORREGIOES -> PERCENTUAL = 33.33% | QUANTIA = R$ 33.333.333,33

        * SÓ AQUI, O CALCULO DO RATEIO TOTAL POR MICRORREGIOES DÁ 99.99% E R$ 99.999.999,99
          |-> FALTA 0.01% E R$ 0,01

        CASO DE TESTE [CAPARAÓ, CENTRAL SERRANA E CENTRAL SUL]:

        1. CAPARAÓ: 12 CIDADES -> PERCENTUAL: ~2.77% | QUANTIA: ~R$ 2.777.777,78
        2. CENTRAL SERRANA: 5 CIDADES -> PERCENTUAL: ~6.66% | QUANTIA: ~R$ 6.666.666,67
        3. CENTRAL SUL: 7 CIDADES -> PERCENTUAL: ~4.76% | QUANTIA: ~R$ 4.761.904,76
        
        * PROCESSO INVERSO (CALCULO TOTAL RATEIO POR CIDADES):
          |-> TOTAL PERCENTUAL: 99.86000000000003 (FALTA 0.13999999999997)
          |-> TOTAL QUANTIA: 100000000.03000005 (SOBRA ~0.3)
          
      + ABORDAGEM: UTILIZAR LOOP FOR PARA PREENCHER VALORES
        - QUANDO FOR A VEZ DO ULTIMO ELEMENTO (array[array.length - 1]), 
          INCLUIR A "DIFERENÇA" (PODE SER PRA CIMA OU PRA BAIXO)
          NO VALOR
        
          PROS:
          |-> CORRIGE ESSE PROBLEMA (NÃO É 100%)

          CONS:
          |->  TORNA PROCESSO MEIO ALEATÓRIO

    */

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
  }

  private rateioMicrorregiaoFormArrayValueChanges$(): void {
    this.rateioMicrorregiaoFormArray.valueChanges
      .pipe(debounceTime(TEMPO_RECALCULO))
      .subscribe((rateioMicrorregiaoFormArrayValue) => {
        const totalRateio =
          RateioCalculoHelper.calcularTotalRateioPorMicrorregioes(
            rateioMicrorregiaoFormArrayValue
          );

        console.log('por microrregioes:');
        console.log(totalRateio);
      });
  }

  private rateioCidadeFormArrayValueChanges$(): void {
    this.rateioCidadeFormArray.valueChanges
      .pipe(debounceTime(TEMPO_RECALCULO))
      .subscribe((rateioCidadeFormArrayValue) => {
        const totalRateio = RateioCalculoHelper.calcularTotalRateioPorCidades(
          rateioCidadeFormArrayValue
        );

        console.log('por cidades:');
        console.log(totalRateio);
      });
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
