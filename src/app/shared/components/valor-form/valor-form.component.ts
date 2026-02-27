import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import {
  AbstractControl,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';

import { TemplatesModule } from '../../templates/templates.module';

import { NgSelectModule } from '@ng-select/ng-select';
import { NgxMaskDirective } from 'ngx-mask';

import { ValorService } from '../../../core/services/valor/valor.service';

import { IMoeda } from '../../../core/interfaces/moeda.interface';
import { IOpcoesDropdown } from '../../../core/interfaces/opcoes-dropdown.interface';

import { NgxMaskTransformFunctionHelper } from '../../../core/helpers/ngx-mask-transform-function.helper';
import { getSimboloMoeda } from '../../../core/utils/functions';
import { COLECAO_TEXTO_TOOLTIP_FORMULARIO_PROJETO } from '../../../core/utils/constants';
import { IEstruturaCamposComplementarProjeto } from '../../../core/interfaces/estrutura.campo.complementar.dic.interface';
import { StatusProjetoEnum } from '../../../core/enums/status-projeto.enum';

@Component({
  selector: 'siscap-valor-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TemplatesModule,
    NgSelectModule,
    NgxMaskDirective,
  ],
  templateUrl: './valor-form.component.html',
  styleUrl: './valor-form.component.scss',
})
export class ValorFormComponent {
  public moedasList = input<Array<IMoeda>>();
  public tiposValorOpcoes = input<Array<IOpcoesDropdown>>();
  public camposComplementarProjeto = input<Array<IEstruturaCamposComplementarProjeto>>([]);
  public statusProjeto = input<string>();
  public contextoValor = input<string>('DIC');

  public getSimboloMoeda: (moeda: string | undefined | null) => string =
    getSimboloMoeda;

  constructor(public valorService: ValorService) { }

  public getControl(controlName: string): AbstractControl<any, any> {
    return this.valorService.valorFormGroup.get(controlName) as AbstractControl<
      any,
      any
    >;
  }

  public rtlCurrencyInputTransformFn =
    NgxMaskTransformFunctionHelper.rtlCurrencyInputTransformFn;

  public rtlCurrencyOutputTransformFn =
    NgxMaskTransformFunctionHelper.rtlCurrencyOutputTransformFn;

  public projetoTooltip: Record<string, string> =
    COLECAO_TEXTO_TOOLTIP_FORMULARIO_PROJETO;

  public deveComplementarCampo(nomeControle: string): boolean {
    const deveComplementar = this.camposComplementarProjeto().some(
      campo => campo.idCampo === nomeControle
    );
    return (this.statusProjeto() == StatusProjetoEnum.Em_Complementacao && deveComplementar) || false;
  }

  public mensagemComplementarCampo(nomeControle: string): string {
    const campoEncontrado = this.camposComplementarProjeto().find(
      campo => campo.idCampo === nomeControle
    );
    return campoEncontrado ? campoEncontrado.descricaoComplemento : '';
  }

}
