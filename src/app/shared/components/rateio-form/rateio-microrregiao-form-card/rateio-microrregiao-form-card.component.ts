import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';

import { debounceTime, fromEvent } from 'rxjs';
import { NgxMaskDirective } from 'ngx-mask';

import { RateioService } from '../../../../core/services/rateio/rateio.service';

import { RateioLocalidadeFormType } from '../../../../core/types/form/rateio-form.type';

import { ILocalidadeOpcoesDropdown } from '../../../../core/interfaces/opcoes-dropdown.interface';

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
  @Input() public microrregiao!: ILocalidadeOpcoesDropdown;
  @Input() public isModoEdicao: boolean = false;

  public rateioLocalidadeFormGroupMicrorregiao!: FormGroup<RateioLocalidadeFormType>;

  public microrregiaoBooleanCheckbox: boolean = false;

  public bloquearMicrorregiaoBooleanCheckbox: boolean = false;

  public rtlCurrencyInputTransformFn =
    NgxMaskTransformFunctionHelper.rtlCurrencyInputTransformFn;

  public rtlCurrencyOutputTransformFn =
    NgxMaskTransformFunctionHelper.rtlCurrencyOutputTransformFn;

  public percentOutputTransformFn =
    NgxMaskTransformFunctionHelper.percentOutputTransformFn;

  constructor(public rateioService: RateioService) {}

  ngOnInit(): void {
    this.inicializarRateioLocalidadeFormGroupMicrorregiao();

    this.rateioService.municipioBooleanCheckboxChange$.subscribe(
      (localidadeCheckboxChange) => {
        const resultadoMicrorregiaoCheckbox =
          this.rateioService.checarValorCheckboxPorMicrorregiao(
            localidadeCheckboxChange,
            this.microrregiao.id
          );

        if (resultadoMicrorregiaoCheckbox != null)
          this.bloquearMicrorregiaoBooleanCheckbox =
            resultadoMicrorregiaoCheckbox;
      }
    );
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
          if (!this.rateioService.quantiaFormControlReferencia) {
            beforeInputEvent.preventDefault();
            document
              .querySelector('div#nullQuantiaFormControlValueCol')
              ?.animate(SIDEWAYS_SHAKE.keyframes, SIDEWAYS_SHAKE.options);
          }
        }
      );

      fromEvent(microrregiaoPercentualRateioInput, 'input')
        .pipe(debounceTime(TEMPO_INPUT_USUARIO))
        .subscribe(() => {
          this.rateioLocalidadeFormGroupMicrorregiao.controls.quantia.patchValue(
            this.rateioService.calcularQuantiaPorPercentual(
              this.rateioLocalidadeFormGroupMicrorregiao.controls.percentual
                .value
            )
          );
        });
    }

    if (microrregiaoQuantiaRateioInput) {
      fromEvent(microrregiaoQuantiaRateioInput, 'beforeinput').subscribe(
        (beforeInputEvent) => {
          if (!this.rateioService.quantiaFormControlReferencia) {
            beforeInputEvent.preventDefault();
            document
              .querySelector('div#nullQuantiaFormControlValueCol')
              ?.animate(SIDEWAYS_SHAKE.keyframes, SIDEWAYS_SHAKE.options);
          }
        }
      );

      fromEvent(microrregiaoQuantiaRateioInput, 'input')
        .pipe(debounceTime(TEMPO_INPUT_USUARIO))
        .subscribe(() => {
          this.rateioLocalidadeFormGroupMicrorregiao.controls.percentual.patchValue(
            this.rateioService.calcularPercentualPorQuantia(
              this.rateioLocalidadeFormGroupMicrorregiao.controls.quantia.value
            )
          );
        });
    }
  }

  public microrregiaoCheckboxChange(): void {
    this.microrregiaoBooleanCheckbox
      ? this.incluirMicrorregiaoNoRateio()
      : this.removerMicrorregiaoDoRateio();

    this.notificarMicrorregiaoCheckboxChange();
  }

  private inicializarRateioLocalidadeFormGroupMicrorregiao(): void {
    const controlIndex =
      this.rateioService.buscarIndiceControleRateioLocalidadeFormGroup(
        this.microrregiao.id
      );

    if (controlIndex !== -1) {
      this.rateioLocalidadeFormGroupMicrorregiao =
        this.rateioService.rateioFormArray.controls[controlIndex];

      this.microrregiaoBooleanCheckbox = true;
      this.notificarMicrorregiaoCheckboxChange();
    } else {
      this.rateioLocalidadeFormGroupMicrorregiao =
        this.rateioService.construirRateioLocalidadeFormGroupPorIdLocalidade(
          this.microrregiao.id
        );
    }

    this.rateioLocalidadeFormGroupMicrorregiao.disable();
  }

  private incluirMicrorregiaoNoRateio(): void {
    this.rateioLocalidadeFormGroupMicrorregiao.enable();
    this.rateioService.incluirLocalidadeNoRateio(
      this.rateioLocalidadeFormGroupMicrorregiao
    );
  }

  private removerMicrorregiaoDoRateio(): void {
    this.rateioService.removerLocalidadeDoRateio(this.microrregiao.id);
    this.rateioLocalidadeFormGroupMicrorregiao.reset();
    this.rateioLocalidadeFormGroupMicrorregiao.disable();
  }

  private notificarMicrorregiaoCheckboxChange(): void {
    this.rateioService.microrregiaoBooleanCheckboxChange$.next({
      idLocalidade: this.microrregiao.id,
      checkboxValue: this.microrregiaoBooleanCheckbox,
    });
  }
}
