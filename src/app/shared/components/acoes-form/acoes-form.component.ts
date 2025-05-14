import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgbTooltipModule, NgbModalModule, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { AcoesService } from '../../../core/services/acoes/acoes.service';
import { NgxMaskTransformFunctionHelper } from '../../../core/helpers/ngx-mask-transform-function.helper';
import { NgxMaskDirective } from 'ngx-mask';

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
    NgxMaskDirective
  ],
  templateUrl: './acoes-form.component.html',
})
export class AcoesFormComponent {
  @Input() descricaoAcaoPrincipal: string;
  @Input() descricaoAcoesSecundarias: string;
  @Input() valorEstimadoAcaoPrincipal: number;
  @Input() public isModoEdicao: boolean = false;

  constructor(
    public acoesService: AcoesService,
    private fb: FormBuilder) {
    this.descricaoAcaoPrincipal = '';
    this.descricaoAcoesSecundarias = '';
	  this.valorEstimadoAcaoPrincipal = 0;
  }

  public rtlCurrencyInputTransformFn =
      NgxMaskTransformFunctionHelper.rtlCurrencyInputTransformFn;
  
    public rtlCurrencyOutputTransformFn =
      NgxMaskTransformFunctionHelper.rtlCurrencyOutputTransformFn;
  
  adicionarAcao(): void {
    const novaAcao = this.fb.group({
      descricaoAcaoPrincipal: [''],
      descricaoAcoesSecundarias: [''],
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
