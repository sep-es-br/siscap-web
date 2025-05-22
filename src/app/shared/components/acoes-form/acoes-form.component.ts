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

  constructor(
    public acoesService: AcoesService,
    private fb: FormBuilder) {
    this.descricaoAcaoPrincipal = '';
    this.descricaoAcaoSecundaria = '';
	  this.valorEstimadoAcaoPrincipal = 0;
  }

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
  
  get acoesFormGroups(): FormGroup[] {
    return this.acoesFormArray.controls as FormGroup[];
  }

  get acoesFormArray(): FormArray {
    return this.acoesService.acoesFormArray;
  }

}
