import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';

import { debounceTime, fromEvent } from 'rxjs';
import { NgxMaskDirective } from 'ngx-mask';

import { RateioService } from '../../../../core/services/rateio/rateio.service';

// import { RateioCidadeFormType } from '../../../../core/types/form/rateio-form.type';

import { ILocalidadeSelectList } from '../../../../core/interfaces/select-list.interface';

import { NgxMaskTransformFunctionHelper } from '../../../../core/helpers/ngx-mask-transform-function.helper';

import { TEMPO_INPUT_USUARIO } from '../../../../core/utils/constants';
import { SIDEWAYS_SHAKE } from '../../../../core/utils/animations';
import { RateioLocalidadeFormType } from '../../../../core/types/form/rateio-form.type';

@Component({
  selector: 'rateio-municipio-form-card',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgxMaskDirective],
  templateUrl: './rateio-municipio-form-card.component.html',
  styleUrl: './rateio-municipio-form-card.component.scss',
})
export class RateioMunicipioFormCardComponent implements OnInit, AfterViewInit {
  @Input() public municipio!: ILocalidadeSelectList;
  @Input() public isModoEdicao: boolean = false;

  public rateioLocalidadeFormGroupMunicipio!: FormGroup<RateioLocalidadeFormType>;

  public municipioBooleanCheckbox: boolean = false;

  public rtlCurrencyInputTransformFn =
    NgxMaskTransformFunctionHelper.rtlCurrencyInputTransformFn;

  public rtlCurrencyOutputTransformFn =
    NgxMaskTransformFunctionHelper.rtlCurrencyOutputTransformFn;

  public percentOutputTransformFn =
    NgxMaskTransformFunctionHelper.percentOutputTransformFn;

  constructor(public rateioService: RateioService) {}

  ngOnInit(): void {
    this.rateioLocalidadeFormGroupMunicipio =
      this.inicializarRateioLocalidadeFormGroupMunicipio();

    // if (this.buscarIndiceRateioMunicipioFormGroup() !== -1) {
    //   this.MunicipioBooleanCheckbox = true;
    // }

    this.rateioLocalidadeFormGroupMunicipio.disable();

    this.rateioService.localidadeCheckboxChange$.subscribe(() => {
      // console.log(`dentro de RateioMunicipioFormCardComponent`);
      // console.log('mudou algum checkbox');

      const valorCheckbox = this.rateioService.buscarValorCheckboxLocalidade(
        this.municipio.id
      );

      console.log('MUNICIPIO');
      console.log(valorCheckbox);
    });
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

    // this.rateioService.MunicipioCheckboxChange$.next({
    //   idMunicipio: this.Municipio.id,
    //   checkboxValue: this.MunicipioBooleanCheckbox,
    //   idMicrorregiaoPai: this.Municipio.idMicrorregiao,
    // });
  }

  private inicializarRateioLocalidadeFormGroupMunicipio(): FormGroup<RateioLocalidadeFormType> {
    return (
      this.rateioService.rateioFormArray.controls[
        this.rateioService.buscarIndiceControleRateioLocalidadeFormGroup(
          this.municipio.id
        )
      ] ??
      this.rateioService.construirRateioLocalidadeFormGroupPorIdLocalidade(
        this.municipio.id
      )
    );
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

    // this.rateioMunicipioFormGroup.reset({ idMunicipio: this.municipio.id });
    // this.rateioMunicipioFormGroup.disable();
  }

  // private buscarIndiceRateioMunicipioFormGroup(): number {
  //   return this.rateioService.rateioMunicipioFormArray.controls.findIndex(
  //     (rateioMunicipioFormGroup) =>
  //       rateioMunicipioFormGroup.get('idMunicipio')?.value === this.municipio.id
  //   );
  // }
}
