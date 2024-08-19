import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { NgbAccordionModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxMaskDirective } from 'ngx-mask';

import { RateioCidadeItemCardComponent } from '../rateio-cidade-item-card/rateio-cidade-item-card.component';

import { RateioService } from '../../../../shared/services/projetos/rateio.service';

import { IMicrorregiaoCidadesSelectList } from '../../../../shared/interfaces/select-list.interface';

import { NgxMaskTransformFunctionHelper } from '../../../../shared/helpers/ngx-mask-transform-function.helper';

@Component({
  selector: 'microrregiao-item-card',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgxMaskDirective,
    NgbAccordionModule,
    RateioCidadeItemCardComponent,
  ],
  templateUrl: './rateio-microrregiao-item-card.component.html',
  styleUrl: './rateio-microrregiao-item-card.component.scss',
})
export class RateioMicrorregiaoItemCardComponent {
  @Input() public microrregiao!: IMicrorregiaoCidadesSelectList;
  @Input() public index!: number;
  @Input() public formMode: string = '';
  @Input() public isEdit: boolean = false;

  public microrregiaoBooleanCheckbox: boolean = false;

  public microrregiaoPercentualRateio: number | null = null;
  public microrregiaoQuantiaRateio: number | null = null;

  public rtlCurrencyInputTransformFn =
    NgxMaskTransformFunctionHelper.rtlCurrencyInputTransformFn;

  public rtlCurrencyOutputTransformFn =
    NgxMaskTransformFunctionHelper.rtlCurrencyOutputTransformFn;

  public percentInputTransformFn =
    NgxMaskTransformFunctionHelper.percentInputTransformFn;

  public percentOutputTransformFn =
    NgxMaskTransformFunctionHelper.percentOutputTransformFn;

  constructor(private _rateioService: RateioService) {
    this._rateioService.calculoAutomaticoObs$.subscribe((tipo) => {
      if (tipo == 'cidade') {
        this.calcularValoresMicrorregiaoAutomatico();
      }
    });
  }

  public microrregiaoCheckboxChange(event: Event): void {
    const eventTarget = event.target as HTMLInputElement;

    this.microrregiaoBooleanCheckbox = eventTarget.checked;

    if (!this.microrregiaoBooleanCheckbox) {
      this.microrregiaoPercentualRateio = null;
      this.microrregiaoQuantiaRateio = null;
    }
  }

  public cidadeFilhaCheckboxChangeEvent(event: boolean) {
    if (event) {
      this.microrregiaoBooleanCheckbox = event;
    }
  }

  public microrregiaoQuantiaRateioChange(): void {
    this.microrregiaoPercentualRateio =
      this._rateioService.calcularPercentualPorQuantia(
        this.microrregiaoQuantiaRateio
      );
  }

  private calcularValoresMicrorregiaoAutomatico(): void {
    const quantiaPorMicrorregiao =
      this._rateioService.calcularValoresMicrorregiaoAutomatico(
        this.microrregiao.id
      );

    if (quantiaPorMicrorregiao && this.microrregiaoBooleanCheckbox) {
      this.microrregiaoQuantiaRateio = quantiaPorMicrorregiao;
      this.microrregiaoQuantiaRateioChange();
    }
  }
}
