import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';

import { debounceTime, fromEvent } from 'rxjs';
import { NgxMaskDirective } from 'ngx-mask';

import { RateioService } from '../../../../core/services/rateio/rateio.service';

import { RateioCidadeFormType } from '../../../../core/types/form/rateio-form.type';

import { ICidadeSelectList } from '../../../../core/interfaces/select-list.interface';

import { NgxMaskTransformFunctionHelper } from '../../../../core/helpers/ngx-mask-transform-function.helper';

import { TEMPO_INPUT_USUARIO } from '../../../../core/utils/constants';
import { SIDEWAYS_SHAKE } from '../../../../core/utils/animations';

@Component({
  selector: 'rateio-cidade-form-card',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgxMaskDirective],
  templateUrl: './rateio-cidade-form-card.component.html',
  styleUrl: './rateio-cidade-form-card.component.scss',
})
export class RateioCidadeFormCardComponent implements OnInit, AfterViewInit {
  @Input() public cidade!: ICidadeSelectList;
  @Input() public isModoEdicao: boolean = false;

  public rateioCidadeFormGroup!: FormGroup<RateioCidadeFormType>;

  public cidadeBooleanCheckbox: boolean = false;

  public rtlCurrencyInputTransformFn =
    NgxMaskTransformFunctionHelper.rtlCurrencyInputTransformFn;

  public rtlCurrencyOutputTransformFn =
    NgxMaskTransformFunctionHelper.rtlCurrencyOutputTransformFn;

  public percentOutputTransformFn =
    NgxMaskTransformFunctionHelper.percentOutputTransformFn;

  constructor(public rateioService: RateioService) {}

  ngOnInit(): void {
    this.rateioCidadeFormGroup = this.inicializarRateioCidadeFormGroup();

    if (this.buscarIndiceRateioCidadeFormGroup() !== -1) {
      this.cidadeBooleanCheckbox = true;
    }

    this.rateioCidadeFormGroup.disable();
  }

  ngAfterViewInit(): void {
    const cidadePercentualRateioInput = document.querySelector(
      `input#cidade-percentual-rateio-${this.cidade.id}`
    );

    const cidadeQuantiaRateioInput = document.querySelector(
      `input#cidade-quantia-rateio-${this.cidade.id}`
    );

    if (cidadePercentualRateioInput) {
      fromEvent(cidadePercentualRateioInput, 'beforeinput').subscribe(
        (beforeInputEvent) => {
          if (!this.rateioService.quantiaFormControlReferencia) {
            beforeInputEvent.preventDefault();
            document
              .querySelector('div#nullQuantiaFormControlValueCol')
              ?.animate(SIDEWAYS_SHAKE.keyframes, SIDEWAYS_SHAKE.options);
          }
        }
      );

      fromEvent(cidadePercentualRateioInput, 'input')
        .pipe(debounceTime(TEMPO_INPUT_USUARIO))
        .subscribe(() => {
          this.rateioCidadeFormGroup.controls.quantia.patchValue(
            this.rateioService.calcularQuantiaPorPercentual(
              this.rateioCidadeFormGroup.controls.percentual.value
            )
          );
        });
    }

    if (cidadeQuantiaRateioInput) {
      fromEvent(cidadeQuantiaRateioInput, 'beforeinput').subscribe(
        (beforeInputEvent) => {
          if (!this.rateioService.quantiaFormControlReferencia) {
            beforeInputEvent.preventDefault();
            document
              .querySelector('div#nullQuantiaFormControlValueCol')
              ?.animate(SIDEWAYS_SHAKE.keyframes, SIDEWAYS_SHAKE.options);
          }
        }
      );

      fromEvent(cidadeQuantiaRateioInput, 'input')
        .pipe(debounceTime(TEMPO_INPUT_USUARIO))
        .subscribe(() => {
          this.rateioCidadeFormGroup.controls.percentual.patchValue(
            this.rateioService.calcularPercentualPorQuantia(
              this.rateioCidadeFormGroup.controls.quantia.value
            )
          );
        });
    }
  }

  public cidadeCheckboxChange(): void {
    this.cidadeBooleanCheckbox
      ? this.incluirCidadeNoRateio()
      : this.removerCidadeDoRateio();

    this.rateioService.cidadeCheckboxChange$.next({
      idCidade: this.cidade.id,
      checkboxValue: this.cidadeBooleanCheckbox,
      idMicrorregiaoPai: this.cidade.idMicrorregiao,
    });
  }

  private inicializarRateioCidadeFormGroup(): FormGroup<RateioCidadeFormType> {
    return (
      this.rateioService.rateioCidadeFormArray.controls[
        this.buscarIndiceRateioCidadeFormGroup()
      ] ??
      this.rateioService.construirRateioCidadeFormGroupSelectList(
        this.cidade.id
      )
    );
  }

  private incluirCidadeNoRateio(): void {
    this.rateioCidadeFormGroup.enable();
    this.rateioService.incluirCidadeNoRateio(this.rateioCidadeFormGroup);
  }

  private removerCidadeDoRateio(): void {
    this.rateioService.removerCidadeDoRateio(
      this.buscarIndiceRateioCidadeFormGroup()
    );
    this.rateioCidadeFormGroup.reset({ idCidade: this.cidade.id });
    this.rateioCidadeFormGroup.disable();
  }

  private buscarIndiceRateioCidadeFormGroup(): number {
    return this.rateioService.rateioCidadeFormArray.controls.findIndex(
      (rateioCidadeFormGroup) =>
        rateioCidadeFormGroup.get('idCidade')?.value === this.cidade.id
    );
  }
}
