import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';

import { debounceTime } from 'rxjs';
import { NgxMaskDirective } from 'ngx-mask';

import { OldRateioService } from '../../../../shared/services/projetos/old-rateio.service';

// import { RateioFormModel } from '../../../../shared/models/rateio.model';

import { ISelectList } from '../../../../shared/interfaces/select-list.interface';

import { NgxMaskTransformFunctionHelper } from '../../../../shared/helpers/ngx-mask-transform-function.helper';

@Component({
  selector: 'cidade-item-card',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgxMaskDirective],
  templateUrl: './rateio-cidade-item-card.component.html',
  styleUrl: './rateio-cidade-item-card.component.scss',
})
export class RateioCidadeItemCardComponent implements OnChanges, AfterViewInit {
  @Input() public cidade!: ISelectList;
  @Input() public microrregiaoId: number = 0;
  @Input() public microrregiaoBooleanCheckbox: boolean = false;
  @Input() public microrregiaoPercentualRateio: number | null = null;
  @Input() public microrregiaoQuantiaRateio: number | null = null;
  @Input() public formMode: string = '';
  @Input() public isEdit: boolean = false;

  @Output('cidadeCheck')
  public cidadeCheckboxChangeEvent: EventEmitter<boolean> =
    new EventEmitter<boolean>();

  // public rateioCidadeForm!: FormGroup<RateioFormModel>;
  public rateioCidadeForm!: FormGroup<any>;

  public cidadeBooleanCheckbox: boolean = false;

  public cidadePercentualRateio: number | null = null;

  public rtlCurrencyInputTransformFn =
    NgxMaskTransformFunctionHelper.rtlCurrencyInputTransformFn;

  public rtlCurrencyOutputTransformFn =
    NgxMaskTransformFunctionHelper.rtlCurrencyOutputTransformFn;

  public percentInputTransformFn =
    NgxMaskTransformFunctionHelper.percentInputTransformFn;

  public percentOutputTransformFn =
    NgxMaskTransformFunctionHelper.percentOutputTransformFn;

  constructor(private _oldRateioService: OldRateioService) {
    this._oldRateioService.calculoAutomaticoObs$.subscribe((tipo) => {
      if (tipo == 'microrregiao') {
        this.calcularValoresCidadeAutomatico();
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['cidade']?.isFirstChange())
      this.rateioCidadeForm = this._oldRateioService.construirRateioFormGroup(
        this.cidade.id
      );

    if (
      changes['microrregiaoBooleanCheckbox'] &&
      !changes['microrregiaoBooleanCheckbox']?.isFirstChange()
    ) {
      this.cidadeCheckboxChangeMicrorregiaoPai();
    }
  }

  ngAfterViewInit(): void {
    if (!!this.rateioCidadeForm.value.quantia) {
      this.tratarEdicaoRateioCidadeForm();
    }

    const quantiaFormControl = this.rateioCidadeForm.get(
      'quantia'
    ) as FormControl<number | null>;

    quantiaFormControl.valueChanges
      .pipe(debounceTime(750))
      .subscribe((quantia) => {
        this.cidadePercentualRateio =
          this._oldRateioService.calcularPercentualPorQuantia(quantia);
      });
  }

  public cidadeCheckboxChangeMicrorregiaoPai(): void {
    if (this.formMode != 'editar' || this.isEdit) {
      if (this.microrregiaoBooleanCheckbox != this.cidadeBooleanCheckbox) {
        this.cidadeBooleanCheckbox = this.microrregiaoBooleanCheckbox;
        this.cidadeBooleanCheckbox
          ? this.incluirCidadeNoRateio()
          : this.removerCidadeDoRateio();
      }
    }
  }

  public cidadeCheckboxChange(event: Event): void {
    const eventTarget = event.target as HTMLInputElement;

    this.cidadeBooleanCheckbox = eventTarget.checked;

    this.cidadeCheckboxChangeEvent.emit(
      !this.microrregiaoBooleanCheckbox && this.cidadeBooleanCheckbox
    );

    this.cidadeBooleanCheckbox
      ? this.incluirCidadeNoRateio()
      : this.removerCidadeDoRateio();
  }

  private incluirCidadeNoRateio(): void {
    this._oldRateioService.incluirCidadeNoRateio(this.rateioCidadeForm);
    this.rateioCidadeForm.enable();
  }

  private removerCidadeDoRateio(): void {
    this._oldRateioService.removerCidadeDoRateio(this.rateioCidadeForm);
    this.rateioCidadeForm.reset({ idCidade: this.cidade.id });
    this.rateioCidadeForm.disable();
  }

  private calcularValoresCidadeAutomatico(): void {
    const quantiaPorCidade =
      this._oldRateioService.calcularValoresCidadeAutomatico(
        this.microrregiaoId,
        this.microrregiaoQuantiaRateio
      );

    if (quantiaPorCidade && this.rateioCidadeForm.enabled) {
      this.rateioCidadeForm.patchValue({
        quantia: quantiaPorCidade,
      });
    }
  }

  private tratarEdicaoRateioCidadeForm(): void {
    this.cidadeBooleanCheckbox = true;
    this.cidadeCheckboxChangeEvent.emit(true);
    if (this.formMode != 'editar' || this.isEdit) {
      this.rateioCidadeForm.enable();
    }
    this.cidadePercentualRateio =
      this._oldRateioService.calcularPercentualPorQuantia(
        this.rateioCidadeForm.value.quantia!
      );
    setTimeout(
      () => this._oldRateioService.calculoAutomaticoObs$.next('cidade'),
      750
    );
  }
}
