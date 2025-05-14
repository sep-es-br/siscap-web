import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgbTooltipModule, NgbModalModule, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { AcoesService } from '../../../core/services/acoes/acoes.service';

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
  
  adicionarAcao(): void {
    const novaAcao = this.fb.group({
      descricaoAcaoPrincipal: ['', Validators.maxLength(2000)],
      descricaoAcoesSecundarias: ['', Validators.maxLength(2000)],
      valorEstimadoAcaoPrincipal: ['', [Validators.required, Validators.min(0.01)]]
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
