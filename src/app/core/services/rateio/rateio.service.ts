import { Injectable } from '@angular/core';
import {
  FormArray,
  FormGroup,
  NonNullableFormBuilder,
  Validators,
} from '@angular/forms';

import { debounceTime, Subject } from 'rxjs';

import {
  RateioLocalidadeFormType,
  RateioLocalidadeFormTypeValue,
} from '../../types/form/rateio-form.type';

import { RateioCalculoHelper } from '../../helpers/rateio-calculo.helper';

import { TEMPO_INPUT_USUARIO, TEMPO_RECALCULO } from '../../utils/constants';
import { getSimboloMoeda } from '../../utils/functions';

import { ILocalidadeSelectList } from '../../interfaces/select-list.interface';
import { RateioModel } from '../../models/rateio.model';

export interface ILocalidadeCheckboxChange {
  idLocalidade: number;
  tipo: 'Microrregiao' | 'Municipio';
  checkboxValue: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class RateioService {
  public rateioFormArray: FormArray<FormGroup<RateioLocalidadeFormType>> =
    new FormArray<FormGroup<RateioLocalidadeFormType>>(
      [],
      [Validators.required, Validators.minLength(1)]
    );

  private _localidadesSelectList: Array<ILocalidadeSelectList> = [];

  public get localidadesSelectList(): Array<ILocalidadeSelectList> {
    return this._localidadesSelectList;
  }

  public set localidadesSelectList(
    localidadesSelectList: Array<ILocalidadeSelectList>
  ) {
    this._localidadesSelectList = localidadesSelectList;
    this.controleCheckboxLocalidades =
      this.mapearControlesCheckboxLocalidades();
  }

  private _controleCheckboxLocalidades: Record<number, boolean> = {};

  public get controleCheckboxLocalidades(): Record<number, boolean> {
    return this._controleCheckboxLocalidades;
  }

  private set controleCheckboxLocalidades(
    checkboxLocalidadesObj: Record<number, boolean>
  ) {
    this._controleCheckboxLocalidades = checkboxLocalidadesObj;
  }

  private _localidadeCheckboxChange$: Subject<ILocalidadeCheckboxChange> =
    new Subject<ILocalidadeCheckboxChange>();

  public get localidadeCheckboxChange$(): Subject<ILocalidadeCheckboxChange> {
    return this._localidadeCheckboxChange$;
  }

  // public rateioMicrorregiaoFormArray: FormArray<
  //   FormGroup<RateioMicrorregiaoFormType>
  // > = new FormArray<FormGroup<RateioMicrorregiaoFormType>>([]);

  // public rateioCidadeFormArray: FormArray<FormGroup<RateioCidadeFormType>> =
  //   new FormArray<FormGroup<RateioCidadeFormType>>([]);

  // private get _rateioMicrorregiaoControls(): Array<
  //   FormGroup<RateioMicrorregiaoFormType>
  // > {
  //   return this.rateioMicrorregiaoFormArray.controls;
  // }

  // private get _rateioMicrorregiaoValue(): Array<RateioMicrorregiaoFormTypeValue> {
  //   return this.rateioMicrorregiaoFormArray.value;
  // }

  // private get _rateioCidadeControls(): Array<FormGroup<RateioCidadeFormType>> {
  //   return this.rateioCidadeFormArray.controls;
  // }

  // private get _rateioCidadeValue(): Array<RateioCidadeFormTypeValue> {
  //   return this.rateioCidadeFormArray.value;
  // }

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

  // private _microrregioesCidadesMapObject: Record<number, boolean> = {};

  // public set microrregioesCidadesMapObject(
  //   microrregioesCidadesMapObject: Record<number, boolean>
  // ) {
  //   this._microrregioesCidadesMapObject = microrregioesCidadesMapObject;
  // }

  // private _cidadeCheckboxChange$: Subject<ICidadeCheckboxChange> =
  //   new Subject<ICidadeCheckboxChange>();

  // public get cidadeCheckboxChange$(): Subject<ICidadeCheckboxChange> {
  //   return this._cidadeCheckboxChange$;
  // }

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
      });
  }

  public filtrarLocalidadesPorMicrorregiao(): Array<ILocalidadeSelectList> {
    return this.localidadesSelectList.filter(
      (localidade) => localidade.tipo === 'Microrregiao'
    );
  }

  public filtrarLocalidadesPorMunicipio(
    idMicrorregiao: number
  ): Array<ILocalidadeSelectList> {
    return this.localidadesSelectList.filter(
      (localidade) =>
        localidade.tipo === 'Municipio' &&
        localidade.idLocalidadePai === idMicrorregiao
    );
  }

  public verificarControleLocalidadesCheckbox(
    localidadeCheckboxChange: ILocalidadeCheckboxChange
  ): void {
    this.controleCheckboxLocalidades[localidadeCheckboxChange.idLocalidade] =
      localidadeCheckboxChange.checkboxValue;

    if (localidadeCheckboxChange.tipo === 'Microrregiao') {
      this.alterarCheckboxLocalidadePorMicrorregiao(localidadeCheckboxChange);
    }

    if (localidadeCheckboxChange.tipo === 'Municipio') {
      this.alterarCheckboxLocalidadePorMunicipio(localidadeCheckboxChange);
    }
  }

  public buscarValorCheckboxLocalidade(idLocalidade: number): boolean {
    return this.controleCheckboxLocalidades[idLocalidade];
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
    const index =
      this.buscarIndiceControleRateioLocalidadeFormGroup(idLocalidade);
    this.rateioFormArray.removeAt(index);
  }

  // public construirRateioMicrorregiaoFormArray(
  //   rateioMicrorregiao?: Array<IRateioMicrorregiao>
  // ): FormArray<FormGroup<RateioMicrorregiaoFormType>> {
  //   const rateioMicrorregiaoFormArray = this._nnfb.array<
  //     FormGroup<RateioMicrorregiaoFormType>
  //   >([], [Validators.required, Validators.minLength(1)]);

  //   if (rateioMicrorregiao) {
  //     rateioMicrorregiao.forEach((microrregiao) => {
  //       rateioMicrorregiaoFormArray.push(
  //         this.construirRateioMicrorregiaoFormGroup(microrregiao)
  //       );
  //     });
  //   }

  //   this.rateioMicrorregiaoFormArray = rateioMicrorregiaoFormArray;

  //   this.rateioMicrorregiaoFormArrayValueChanges$();

  //   return this.rateioMicrorregiaoFormArray;
  // }

  // public construirRateioCidadeFormArray(
  //   rateioCidade?: Array<IRateioCidade>
  // ): FormArray<FormGroup<RateioCidadeFormType>> {
  //   const rateioCidadeFormArray = this._nnfb.array<
  //     FormGroup<RateioCidadeFormType>
  //   >([], [Validators.required, Validators.minLength(1)]);

  //   if (rateioCidade) {
  //     rateioCidade.forEach((cidade) => {
  //       rateioCidadeFormArray.push(this.construirRateioCidadeFormGroup(cidade));
  //     });
  //   }

  //   this.rateioCidadeFormArray = rateioCidadeFormArray;

  //   this.rateioCidadeFormArrayValueChanges$();

  //   return this.rateioCidadeFormArray;
  // }

  // public construirRateioMicrorregiaoFormGroup(
  //   microrregiao?: IRateioMicrorregiao
  // ): FormGroup<RateioMicrorregiaoFormType> {
  //   return this._nnfb.group<RateioMicrorregiaoFormType>({
  //     idMicrorregiao: this._nnfb.control(
  //       microrregiao?.idMicrorregiao ?? 0,
  //       Validators.required
  //     ),
  //     percentual: this._nnfb.control(microrregiao?.percentual ?? null, [
  //       Validators.required,
  //       Validators.min(1),
  //     ]),
  //     quantia: this._nnfb.control(microrregiao?.quantia ?? null, [
  //       Validators.required,
  //       Validators.min(1),
  //     ]),
  //   });
  // }

  // public construirRateioMicrorregiaoFormGroupSelectList(
  //   idMicrorregiao: number
  // ): FormGroup<RateioMicrorregiaoFormType> {
  //   const rateioMicrorregiaoFormGroup =
  //     this.construirRateioMicrorregiaoFormGroup();
  //   rateioMicrorregiaoFormGroup.patchValue({ idMicrorregiao });
  //   return rateioMicrorregiaoFormGroup;
  // }

  // public construirRateioCidadeFormGroup(
  //   cidade?: IRateioCidade
  // ): FormGroup<RateioCidadeFormType> {
  //   return this._nnfb.group<RateioCidadeFormType>({
  //     idCidade: this._nnfb.control(cidade?.idCidade ?? 0, Validators.required),
  //     percentual: this._nnfb.control(cidade?.percentual ?? null, [
  //       Validators.required,
  //       Validators.min(1),
  //     ]),
  //     quantia: this._nnfb.control(cidade?.quantia ?? null, [
  //       Validators.required,
  //       Validators.min(1),
  //     ]),
  //   });
  // }

  // public construirRateioCidadeFormGroupSelectList(
  //   idCidade: number
  // ): FormGroup<RateioCidadeFormType> {
  //   const rateioCidadeFormGroup = this.construirRateioCidadeFormGroup();
  //   rateioCidadeFormGroup.patchValue({ idCidade });
  //   return rateioCidadeFormGroup;
  // }

  // public incluirMicrorregiaoNoRateio(
  //   microrregiaoFormGroup: FormGroup<RateioMicrorregiaoFormType>
  // ): void {
  //   this.rateioMicrorregiaoFormArray.push(microrregiaoFormGroup);
  // }

  // public incluirCidadeNoRateio(
  //   cidadeFormGroup: FormGroup<RateioCidadeFormType>
  // ): void {
  //   this.rateioCidadeFormArray.push(cidadeFormGroup);
  // }

  // public removerMicrorregiaoDoRateio(index: number): void {
  //   this.rateioMicrorregiaoFormArray.removeAt(index);
  // }

  // public removerCidadeDoRateio(index: number): void {
  //   this.rateioCidadeFormArray.removeAt(index);
  // }

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

  public testeMaluco(idMicrorregiao: number): void {
    console.log(this._controleCheckboxLocalidades);

    console.log(idMicrorregiao);
  }

  private mapearControlesCheckboxLocalidades(): Record<number, boolean> {
    let controleCheckboxLocalidadesObj: Record<number, boolean> = {};

    this.localidadesSelectList.forEach((localidade) => {
      Object.defineProperty(controleCheckboxLocalidadesObj, localidade.id, {
        value: false,
      });
    });

    return controleCheckboxLocalidadesObj;
  }

  private alterarCheckboxLocalidadePorMicrorregiao(
    localidadeCheckboxChange: ILocalidadeCheckboxChange
  ): void {
    const idMunicipiosFilhosDaMicrorregiaoMap =
      this.filtrarLocalidadesPorMunicipio(
        localidadeCheckboxChange.idLocalidade
      ).map((municipio) => municipio.id);

    idMunicipiosFilhosDaMicrorregiaoMap.forEach((idMunicipio) => {
      this.controleCheckboxLocalidades[idMunicipio] =
        localidadeCheckboxChange.checkboxValue !=
        this.controleCheckboxLocalidades[idMunicipio]
          ? localidadeCheckboxChange.checkboxValue
          : this.controleCheckboxLocalidades[idMunicipio];
    });
  }

  // AINDA NAO IMPLEMENTADO
  private alterarCheckboxLocalidadePorMunicipio(
    localidadeCheckboxChange: ILocalidadeCheckboxChange
  ): void {
    return;
  }

  private rateioFormArrayValueChanges(): void {
    this.rateioFormArray.valueChanges
      .pipe(debounceTime(TEMPO_RECALCULO))
      .subscribe((rateioFormArrayValue) => {
        this.calcularTotalRateio(rateioFormArrayValue);

        console.log(this.totalRateio);
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

  // public calculoAutomaticoPorMicrorregioes(): void {
  //   if (!this.quantiaFormControlReferencia) {
  //     return;
  //   }

  //   this._rateioMicrorregiaoControls.forEach((rateioMicrorregiaoFormGroup) => {
  //     const rateioCidadeControls =
  //       this.filtrarRateioCidadeControlsPorIdMicrorregiao(
  //         rateioMicrorregiaoFormGroup.controls.idMicrorregiao.value
  //       );

  //     const [percentualCidade, quantiaCidade] =
  //       RateioCalculoHelper.calcularValoresCidadesPorMicrorregiao(
  //         rateioMicrorregiaoFormGroup,
  //         rateioCidadeControls.length
  //       );

  //     rateioCidadeControls.forEach((rateioCidadeFormGroup) => {
  //       rateioCidadeFormGroup.controls.percentual.patchValue(percentualCidade);
  //       rateioCidadeFormGroup.controls.quantia.patchValue(quantiaCidade);
  //     });
  //   });

  //   setTimeout(() => {
  //     this.recalcularDiferencaRateioPorCidades();
  //   }, TEMPO_RECALCULO);
  // }

  // public calculoAutomaticoPorCidades(): void {
  //   if (!this.quantiaFormControlReferencia) {
  //     return;
  //   }

  //   this._rateioMicrorregiaoControls.forEach((rateioMicrorregiaoFormGroup) => {
  //     const [percentualMicrorregiao, quantiaMicrorregiao] =
  //       RateioCalculoHelper.calcularValoresMicrorregiaoPorCidades(
  //         this.filtrarRateioCidadeControlsPorIdMicrorregiao(
  //           rateioMicrorregiaoFormGroup.controls.idMicrorregiao.value
  //         )
  //       );

  //     rateioMicrorregiaoFormGroup.controls.percentual.patchValue(
  //       percentualMicrorregiao
  //     );
  //     rateioMicrorregiaoFormGroup.controls.quantia.patchValue(
  //       quantiaMicrorregiao
  //     );
  //   });

  //   // setTimeout(() => {
  //   //   this.recalcularDiferencaRateioPorMicrorregioes();
  //   // }, TEMPO_RECALCULO);
  // }

  // public limparTotalRateio(): void {
  //   this.totalRateio = {
  //     percentual: 0,
  //     quantia: 0,
  //   };
  // }

  // public checarConsistenciaMicrorregioesCidades(rateioValue: IRateio): boolean {
  //   const rateioMicrorregiaoValueIdMap: Array<number> =
  //     rateioValue.rateioMicrorregiao.map(
  //       (microrregiao) => microrregiao.idMicrorregiao
  //     );

  //   const rateioCidadeValueIdMap: Array<number> = rateioValue.rateioCidade.map(
  //     (cidade) => cidade.idCidade
  //   );

  //   const checkConsistenciaMicrorregioes: boolean =
  //     rateioMicrorregiaoValueIdMap.every((idMicrorregiao: number) =>
  //       rateioCidadeValueIdMap.some((idCidade: number) =>
  //         this._microrregioesCidadesMapObject[idMicrorregiao].includes(idCidade)
  //       )
  //     );

  //   const checkConsistenciaCidades: boolean = rateioCidadeValueIdMap.every(
  //     (idCidade: number) =>
  //       rateioMicrorregiaoValueIdMap
  //         .map(
  //           (idMicrorregiao: number) =>
  //             this._microrregioesCidadesMapObject[idMicrorregiao]
  //         )
  //         .some((cidadesArray: Array<number>) =>
  //           cidadesArray.includes(idCidade)
  //         )
  //   );

  //   return checkConsistenciaMicrorregioes && checkConsistenciaCidades;
  // }

  // private calcularTotalRateio(
  //   rateioValueArray:
  //     | Array<RateioMicrorregiaoFormTypeValue>
  //     | Array<RateioCidadeFormTypeValue>
  // ): void {
  //   const totalRateio =
  //     RateioCalculoHelper.calcularTotalRateio(rateioValueArray);

  //   this.totalRateio = {
  //     percentual: totalRateio[0],
  //     quantia: totalRateio[1],
  //   };
  // }

  // private rateioMicrorregiaoFormArrayValueChanges$(): void {
  //   this.rateioMicrorregiaoFormArray.valueChanges
  //     .pipe(debounceTime(TEMPO_RECALCULO))
  //     .subscribe((rateioMicrorregiaoFormArrayValue) => {
  //       this.calcularTotalRateio(rateioMicrorregiaoFormArrayValue);
  //     });
  // }

  // private rateioCidadeFormArrayValueChanges$(): void {
  //   this.rateioCidadeFormArray.valueChanges
  //     .pipe(debounceTime(TEMPO_RECALCULO))
  //     .subscribe((rateioCidadeFormArrayValue) => {
  //       this.calcularTotalRateio(rateioCidadeFormArrayValue);
  //     });
  // }

  // // private recalcularDiferencaRateioPorMicrorregioes(): void {
  // //   if (!this.quantiaFormControlReferencia) {
  // //     return;
  // //   }

  // //   const totalRateio = RateioCalculoHelper.calcularTotalRateioPorMicrorregioes(
  // //     this._rateioMicrorregiaoValue
  // //   );

  // //   const diferencaPercentual = 100 - totalRateio[0];
  // //   const diferencaQuantia = this.quantiaFormControlReferencia - totalRateio[1];

  // //   if (diferencaPercentual === 0 && diferencaQuantia === 0) {
  // //     return;
  // //   }

  // //   const rateioMicrorregiaoFormGroupAleatorio =
  // //     this._rateioMicrorregiaoControls[
  // //       Math.floor(Math.random() * this._rateioMicrorregiaoControls.length)
  // //     ];

  // //   const percentualRateioMicrorregiaoFormGroupAleatorio =
  // //     rateioMicrorregiaoFormGroupAleatorio.controls.percentual;

  // //   const quantiaRateioMicrorregiaoFormGroupAleatorio =
  // //     rateioMicrorregiaoFormGroupAleatorio.controls.quantia;

  // //   percentualRateioMicrorregiaoFormGroupAleatorio.patchValue(
  // //     percentualRateioMicrorregiaoFormGroupAleatorio.value! +
  // //       diferencaPercentual
  // //   );

  // //   quantiaRateioMicrorregiaoFormGroupAleatorio.patchValue(
  // //     quantiaRateioMicrorregiaoFormGroupAleatorio.value! + diferencaQuantia
  // //   );
  // // }

  // private recalcularDiferencaRateioPorCidades(): void {
  //   if (!this.quantiaFormControlReferencia) {
  //     return;
  //   }

  //   if (this._rateioCidadeControls.length === 0) {
  //     return;
  //   }

  //   const totalRateio = RateioCalculoHelper.calcularTotalRateio(
  //     this._rateioCidadeValue
  //   );

  //   const diferencaPercentual = 100 - totalRateio[0];
  //   const diferencaQuantia = this.quantiaFormControlReferencia - totalRateio[1];

  //   if (diferencaPercentual === 0 && diferencaQuantia === 0) {
  //     return;
  //   }

  //   const rateioCidadeFormGroupAleatorio =
  //     this._rateioCidadeControls[
  //       Math.floor(Math.random() * this._rateioCidadeControls.length)
  //     ];

  //   const percentualRateioCidadeFormGroupAleatorio =
  //     rateioCidadeFormGroupAleatorio.controls.percentual;

  //   const quantiaRateioCidadeFormGroupAleatorio =
  //     rateioCidadeFormGroupAleatorio.controls.quantia;

  //   percentualRateioCidadeFormGroupAleatorio.patchValue(
  //     percentualRateioCidadeFormGroupAleatorio.value! + diferencaPercentual
  //   );

  //   quantiaRateioCidadeFormGroupAleatorio.patchValue(
  //     quantiaRateioCidadeFormGroupAleatorio.value! + diferencaQuantia
  //   );
  // }

  // private filtrarRateioCidadeControlsPorIdMicrorregiao(
  //   idMicrorregiao: number
  // ): Array<FormGroup<RateioCidadeFormType>> {
  //   return this._rateioCidadeControls.filter((rateioCidadeFormGroup) =>
  //     this._microrregioesCidadesMapObject[idMicrorregiao].includes(
  //       rateioCidadeFormGroup.controls.idCidade.value
  //     )
  //   );
  // }
}
