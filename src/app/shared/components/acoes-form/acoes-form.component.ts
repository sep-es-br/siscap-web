import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgbTooltipModule, NgbModalModule, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { AcoesService } from '../../../core/services/acoes/acoes.service';
import { NgxMaskTransformFunctionHelper } from '../../../core/helpers/ngx-mask-transform-function.helper';
import { NgxMaskDirective } from 'ngx-mask';
import { TemplatesModule } from '../../templates/templates.module';
import { COLECAO_TEXTO_TOOLTIP_FORMULARIO_PROJETO } from '../../../core/utils/constants';
import { ToastService } from '../../../core/services/toast/toast.service';
import { TipoStatusEnum } from '../../../core/enums/tipo-status.enum';
import { RateioModel } from '../../../core/models/rateio.model';
import { RateioService } from '../../../core/services/rateio/rateio.service';
import { getSimboloMoeda } from '../../../core/utils/functions';


@Component({
  selector: 'siscap-acoes-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgSelectModule,
    NgbTooltipModule,
    NgbModalModule,
    NgbPopoverModule,
    NgxMaskDirective,
    TemplatesModule
  ],
  templateUrl: './acoes-form.component.html',
})
export class AcoesFormComponent {

  @Input() descricaoAcaoPrincipal: string;
  @Input() descricaoAcaoSecundaria: string;
  @Input() valorEstimadoAcaoPrincipal: number;
  @Input() public isModoEdicao: boolean = false;
  @Input() moedaProjeto: string;
  
  constructor(
    public acoesService: AcoesService,
    private readonly _toastService: ToastService,
    private fb: FormBuilder) {
    this.moedaProjeto = '';
    this.descricaoAcaoPrincipal = '';
    this.descricaoAcaoSecundaria = '';
	  this.valorEstimadoAcaoPrincipal = 0;
  }

   public getSimboloMoeda: (moeda: string | undefined | null) => string =
      getSimboloMoeda;

  public TipoStatusEnum = TipoStatusEnum;

  public projetoTooltip: Record<string, string> =
      COLECAO_TEXTO_TOOLTIP_FORMULARIO_PROJETO;

  public rtlCurrencyInputTransformFn =
      NgxMaskTransformFunctionHelper.rtlCurrencyInputTransformFn;
  
    public rtlCurrencyOutputTransformFn =
      NgxMaskTransformFunctionHelper.rtlCurrencyOutputTransformFn;
  
  adicionarAcao(): void {
    const novaAcao = this.fb.group({
      descricaoAcaoPrincipal: [''],
      descricaoAcaoSecundaria: [''],
      valorEstimadoAcaoPrincipal: ['']
    });
    this.acoesFormArray.push(novaAcao);
  }

  removerAcao(index: number): void {
    this.acoesFormArray.removeAt(index);
  }

  public marcarAcaoExcluida(
    index: number ) {

    const acaoFormGroup = this.acoesService.acoesFormArray.at(index) as FormGroup;

    acaoFormGroup.get('idStatus')?.setValue(TipoStatusEnum.Inativo);

    const acaoPrincipal = acaoFormGroup.get('descricaoAcao')?.value || 'Ação';
    const acaoSecundaria = acaoFormGroup.get('descricaoAcaoSecundaria')?.value || '';

    this._toastService.showToast(
        'info',
        'Indicador removido do projeto.',
        [
            `${acaoPrincipal}`,
            `${acaoSecundaria.substring(0, 50)}${acaoSecundaria.length > 50 ? '...' : ''}`
        ]
    );
          
  }

  public isNovaAcao(index: number): boolean {
    return !this.acoesService.acoesFormArraySnapshot.some(
      (membro) => 
        membro.idAcao ===
        this.acoesService.acoesFormArray.at(index).value.idAcao
    );
  }

  public isAcaoAtiva(index: number): boolean {
    const acaoFormGroup = this.acoesService.acoesFormArray.at(index);
    return acaoFormGroup.get('idStatus')?.value !== 2;
  }
  
  get acoesFormGroups(): FormGroup[] {
    return this.acoesFormArray.controls as FormGroup[];
  }

  get acoesFormArray(): FormArray {
    return this.acoesService.acoesFormArray;
  }

}
