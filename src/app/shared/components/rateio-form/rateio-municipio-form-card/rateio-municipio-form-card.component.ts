import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';

import { debounceTime, fromEvent } from 'rxjs';
import { NgxMaskDirective } from 'ngx-mask';

import { RateioService } from '../../../../core/services/rateio/rateio.service';

import { RateioLocalidadeFormType } from '../../../../core/types/form/rateio-form.type';

import { ILocalidadeOpcoesDropdown } from '../../../../core/interfaces/opcoes-dropdown.interface';

import { NgxMaskTransformFunctionHelper } from '../../../../core/helpers/ngx-mask-transform-function.helper';

import { TEMPO_INPUT_USUARIO } from '../../../../core/utils/constants';
import { SIDEWAYS_SHAKE } from '../../../../core/utils/animations';

@Component({
  selector: 'rateio-municipio-form-card',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgxMaskDirective],
  templateUrl: './rateio-municipio-form-card.component.html',
  styleUrl: './rateio-municipio-form-card.component.scss',
})
export class RateioMunicipioFormCardComponent
  implements OnInit, OnChanges, AfterViewInit
{
  @Input() public municipio!: ILocalidadeOpcoesDropdown;
  @Input() public isModoEdicao: boolean = false;

  @Output() public municipioSelectedInitCheck: EventEmitter<number> =
    new EventEmitter<number>();

  public rateioLocalidadeFormGroupMunicipio!: FormGroup<RateioLocalidadeFormType>;

  public municipioBooleanCheckbox: boolean = false;

  public bloquearMunicipioBooleanCheckbox: boolean = false;

  public rtlCurrencyInputTransformFn =
    NgxMaskTransformFunctionHelper.rtlCurrencyInputTransformFn;

  public rtlCurrencyOutputTransformFn =
    NgxMaskTransformFunctionHelper.rtlCurrencyOutputTransformFn;

  public percentOutputTransformFn =
    NgxMaskTransformFunctionHelper.percentOutputTransformFn;

  constructor(public rateioService: RateioService) {}

  ngOnInit(): void {
    this.inicializarRateioLocalidadeFormGroupMunicipio();

    this.rateioService.estadoBooleanCheckboxChange$.subscribe(
      (estadoCheckboxChange) => {
        this.bloquearMunicipioBooleanCheckbox = estadoCheckboxChange;
      }
    );

    this.rateioService.microrregiaoBooleanCheckboxChange$.subscribe(
      (localidadeCheckboxChange) => {
        const resultadoMunicipioCheckbox =
          this.rateioService.checarValorCheckboxPorMunicipio(
            localidadeCheckboxChange,
            this.municipio.idLocalidadePai
          );

        if (resultadoMunicipioCheckbox != null)
          this.bloquearMunicipioBooleanCheckbox = resultadoMunicipioCheckbox;
      }
    );
  }

  /*
      Fez-se necessário a utilização do hook OnChanges
      para configuração inicial do componente no cenário
      de edição, garantindo o comportamento correto.
      No caso da microrregião a qual o município pertence 
      estiver incluída no rateio (portanto o checkbox dela é marcado),
      o comportamento esperado é que o checkbox do município esteja bloqueado.
  */
  ngOnChanges(changes: SimpleChanges): void {
    const isModoEdicaoChange = changes['isModoEdicao'];

    if (isModoEdicaoChange && !isModoEdicaoChange.firstChange) {
      const estadoBooleanCheckboxValue =
        this.rateioService.estadoBooleanCheckboxReferencia;

      const checkboxIdLocalidadePaiValue =
        this.rateioService.checarValorCheckboxLocalidade(
          this.municipio.idLocalidadePai
        );

      this.bloquearMunicipioBooleanCheckbox =
        estadoBooleanCheckboxValue || checkboxIdLocalidadePaiValue;
    }
  }

  ngAfterViewInit(): void {
    const municipioPercentualRateioInput = document.querySelector(
      `input#municipio-percentual-rateio-${this.municipio.id}`
    );

    const municipioQuantiaRateioInput = document.querySelector(
      `input#municipio-quantia-rateio-${this.municipio.id}`
    );

    if (municipioPercentualRateioInput) {
      fromEvent(municipioPercentualRateioInput, 'beforeinput').subscribe(
        (beforeInputEvent) => {
          if (!this.rateioService.quantiaFormControlReferencia) {
            beforeInputEvent.preventDefault();
            document
              .querySelector('div#nullQuantiaFormControlValueCol')
              ?.animate(SIDEWAYS_SHAKE.keyframes, SIDEWAYS_SHAKE.options);
          }
        }
      );

      fromEvent(municipioPercentualRateioInput, 'input')
        .pipe(debounceTime(TEMPO_INPUT_USUARIO))
        .subscribe(() => {
          this.rateioLocalidadeFormGroupMunicipio.controls.quantia.patchValue(
            this.rateioService.calcularQuantiaPorPercentual(
              this.rateioLocalidadeFormGroupMunicipio.controls.percentual.value
            )
          );
        });
    }

    if (municipioQuantiaRateioInput) {
      fromEvent(municipioQuantiaRateioInput, 'beforeinput').subscribe(
        (beforeInputEvent) => {
          if (!this.rateioService.quantiaFormControlReferencia) {
            beforeInputEvent.preventDefault();
            document
              .querySelector('div#nullQuantiaFormControlValueCol')
              ?.animate(SIDEWAYS_SHAKE.keyframes, SIDEWAYS_SHAKE.options);
          }
        }
      );

      fromEvent(municipioQuantiaRateioInput, 'input')
        .pipe(debounceTime(TEMPO_INPUT_USUARIO))
        .subscribe(() => {
          this.rateioLocalidadeFormGroupMunicipio.controls.percentual.patchValue(
            this.rateioService.calcularPercentualPorQuantia(
              this.rateioLocalidadeFormGroupMunicipio.controls.quantia.value
            )
          );
        });
    }
  }

  public municipioCheckboxChange(): void {
    this.municipioBooleanCheckbox
      ? this.incluirMunicipioNoRateio()
      : this.removerMunicipioDoRateio();

    this.notificarMunicipioCheckboxChange();
  }

  private inicializarRateioLocalidadeFormGroupMunicipio(): void {
    const controlIndex =
      this.rateioService.buscarIndiceControleRateioLocalidadeFormGroup(
        this.municipio.id
      );

    if (controlIndex !== -1) {
      this.rateioLocalidadeFormGroupMunicipio =
        this.rateioService.rateioFormArray.controls[controlIndex];
      this.municipioBooleanCheckbox = true;
      this.municipioSelectedInitCheck.emit(this.municipio.idLocalidadePai);
      this.notificarMunicipioCheckboxChange();
    } else {
      this.rateioLocalidadeFormGroupMunicipio =
        this.rateioService.construirRateioLocalidadeFormGroupPorIdLocalidade(
          this.municipio.id
        );
    }

    this.rateioLocalidadeFormGroupMunicipio.disable();
  }

  private incluirMunicipioNoRateio(): void {
    this.rateioLocalidadeFormGroupMunicipio.enable();
    this.rateioService.incluirLocalidadeNoRateio(
      this.rateioLocalidadeFormGroupMunicipio
    );
  }

  private removerMunicipioDoRateio(): void {
    this.rateioService.removerLocalidadeDoRateio(this.municipio.id);
    this.rateioLocalidadeFormGroupMunicipio.reset();
    this.rateioLocalidadeFormGroupMunicipio.disable();
  }

  private notificarMunicipioCheckboxChange(): void {
    this.rateioService.municipioBooleanCheckboxChange$.next({
      idLocalidade: this.municipio.id,
      checkboxValue: this.municipioBooleanCheckbox,
    });
  }
}
