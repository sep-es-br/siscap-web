import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';

import { debounceTime, filter, fromEvent } from 'rxjs';
import { NgxMaskDirective } from 'ngx-mask';

import {
  ICidadeCheckboxChange,
  RateioService,
} from '../../../../core/services/rateio/rateio.service';

import { RateioMicrorregiaoFormType } from '../../../../core/types/form/rateio-form.type';

import { ISelectList } from '../../../../core/interfaces/select-list.interface';

import { NgxMaskTransformFunctionHelper } from '../../../../core/helpers/ngx-mask-transform-function.helper';

import { SIDEWAYS_SHAKE } from '../../../../core/utils/animations';
import { TEMPO_INPUT_USUARIO } from '../../../../core/utils/constants';

@Component({
  selector: 'rateio-microrregiao-form-card',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgxMaskDirective],
  templateUrl: './rateio-microrregiao-form-card.component.html',
  styleUrl: './rateio-microrregiao-form-card.component.scss',
})
export class RateioMicrorregiaoFormCardComponent
  implements OnInit, AfterViewInit
{
  @Input() public microrregiao!: ISelectList;
  @Input() public isModoEdicao: boolean = false;

  @Output('microrregiaoEditInitCheck')
  private microrregiaoEditInitCheck: EventEmitter<void> =
    new EventEmitter<void>();

  public rateioMicrorregiaoFormGroup!: FormGroup<RateioMicrorregiaoFormType>;

  public microrregiaoBooleanCheckbox: boolean = false;

  public rtlCurrencyInputTransformFn =
    NgxMaskTransformFunctionHelper.rtlCurrencyInputTransformFn;

  public rtlCurrencyOutputTransformFn =
    NgxMaskTransformFunctionHelper.rtlCurrencyOutputTransformFn;

  public percentOutputTransformFn =
    NgxMaskTransformFunctionHelper.percentOutputTransformFn;

  constructor(public rateioService: RateioService) {
    this.rateioService.cidadeCheckboxChange$
      .pipe(
        filter(
          (cidadeCheckboxValue) =>
            cidadeCheckboxValue.idMicrorregiaoPai === this.microrregiao.id
        )
      )
      .subscribe((cidadeCheckboxValue) => {
        this.cidadeFilhaCheckboxChange(cidadeCheckboxValue);
      });
  }

  ngOnInit(): void {
    this.rateioMicrorregiaoFormGroup =
      this.inicializarRateioMicrorregiaoFormGroup();

    if (this.buscarIndiceRateioMicrorregiaoFormGroup() !== -1) {
      this.microrregiaoBooleanCheckbox = true;
      this.microrregiaoEditInitCheck.emit();
    }

    this.rateioMicrorregiaoFormGroup.disable();
  }

  ngAfterViewInit(): void {
    const microrregiaoPercentualRateioInput = document.querySelector(
      `input#microrregiao-percentual-rateio-${this.microrregiao.id}`
    );

    const microrregiaoQuantiaRateioInput = document.querySelector(
      `input#microrregiao-quantia-rateio-${this.microrregiao.id}`
    );

    if (microrregiaoPercentualRateioInput) {
      fromEvent(microrregiaoPercentualRateioInput, 'beforeinput').subscribe(
        (beforeInputEvent) => {
          if (!this.rateioService.valorEstimadoReferencia) {
            beforeInputEvent.preventDefault();
            document
              .querySelector('div#nullValorEstimadoCol')
              ?.animate(SIDEWAYS_SHAKE.keyframes, SIDEWAYS_SHAKE.options);
          }
        }
      );

      fromEvent(microrregiaoPercentualRateioInput, 'input')
        .pipe(debounceTime(TEMPO_INPUT_USUARIO))
        .subscribe(() => {
          this.rateioMicrorregiaoFormGroup.controls.quantia.patchValue(
            this.rateioService.calcularQuantiaPorPercentual(
              this.rateioMicrorregiaoFormGroup.controls.percentual.value
            )
          );
        });
    }

    if (microrregiaoQuantiaRateioInput) {
      fromEvent(microrregiaoQuantiaRateioInput, 'beforeinput').subscribe(
        (beforeInputEvent) => {
          if (!this.rateioService.valorEstimadoReferencia) {
            beforeInputEvent.preventDefault();
            document
              .querySelector('div#nullValorEstimadoCol')
              ?.animate(SIDEWAYS_SHAKE.keyframes, SIDEWAYS_SHAKE.options);
          }
        }
      );

      fromEvent(microrregiaoQuantiaRateioInput, 'input')
        .pipe(debounceTime(TEMPO_INPUT_USUARIO))
        .subscribe(() => {
          this.rateioMicrorregiaoFormGroup.controls.percentual.patchValue(
            this.rateioService.calcularPercentualPorQuantia(
              this.rateioMicrorregiaoFormGroup.controls.quantia.value
            )
          );
        });
    }
  }

  public microrregiaoCheckboxChange(): void {
    this.microrregiaoBooleanCheckbox
      ? this.incluirMicrorregiaoNoRateio()
      : this.removerMicrorregiaoDoRateio();
  }

  private inicializarRateioMicrorregiaoFormGroup(): FormGroup<RateioMicrorregiaoFormType> {
    return (
      this.rateioService.rateioMicrorregiaoFormArray.controls[
        this.buscarIndiceRateioMicrorregiaoFormGroup()
      ] ??
      this.rateioService.construirRateioMicrorregiaoFormGroupSelectList(
        this.microrregiao.id
      )
    );
  }

  private cidadeFilhaCheckboxChange(
    cidadeCheckboxValue: ICidadeCheckboxChange
  ): void {
    if (
      !this.microrregiaoBooleanCheckbox &&
      cidadeCheckboxValue.checkboxValue
    ) {
      this.microrregiaoBooleanCheckbox = cidadeCheckboxValue.checkboxValue;

      if (this.buscarIndiceRateioMicrorregiaoFormGroup() === -1) {
        this.incluirMicrorregiaoNoRateio();
      }
    }
  }

  private incluirMicrorregiaoNoRateio(): void {
    this.rateioMicrorregiaoFormGroup.enable();
    this.rateioService.incluirMicrorregiaoNoRateio(
      this.rateioMicrorregiaoFormGroup
    );
  }

  private removerMicrorregiaoDoRateio(): void {
    this.rateioService.removerMicrorregiaoDoRateio(
      this.buscarIndiceRateioMicrorregiaoFormGroup()
    );
    this.rateioMicrorregiaoFormGroup.reset({
      idMicrorregiao: this.microrregiao.id,
    });
    this.rateioMicrorregiaoFormGroup.disable();
  }

  private buscarIndiceRateioMicrorregiaoFormGroup(): number {
    return this.rateioService.rateioMicrorregiaoFormArray.controls.findIndex(
      (rateioMicrorregiaoFormGroup) =>
        rateioMicrorregiaoFormGroup.get('idMicrorregiao')?.value ===
        this.microrregiao.id
    );
  }
}