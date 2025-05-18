import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgbTooltipModule, NgbModalModule, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { IndicadoresService } from '../../../core/services/indicadores/indicadores.service';
import { TemplatesModule } from '../../templates/templates.module';
import { COLECAO_TEXTO_TOOLTIP_FORMULARIO_PROJETO } from '../../../core/utils/constants';

@Component({
  selector: 'siscap-indicadores-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgSelectModule,
    NgbTooltipModule,
    NgbModalModule,
    NgbPopoverModule,
    TemplatesModule,
  ],
  templateUrl: './indicadores-form.component.html',
})
export class IndicadoresFormComponent {
  @Input() tipoIndicador: string;
  @Input() public isModoEdicao: boolean = false;
  @Input() descricaoIndicador: string;
  @Input() descricaoMeta: string;

  constructor(
    public indicadoresService: IndicadoresService,
    private fb: FormBuilder) {
    this.tipoIndicador = '';
    this.descricaoIndicador = '';
    this.descricaoMeta = '';
  }

  adicionarIndicador(): void {
    const novoIndicador = this.fb.group({
      tipoIndicador: [''],
      descricaoIndicador: [''],
      descricaoMeta: ['']
    });
    this.indicadoresFormArray.push(novoIndicador);
  }

  public projetoTooltip: Record<string, string> =
      COLECAO_TEXTO_TOOLTIP_FORMULARIO_PROJETO;

  removerIndicador(index: number): void {
    this.indicadoresFormArray.removeAt(index);
  }

  get indicadoresFormGroups(): FormGroup[] {
    return this.indicadoresFormArray.controls as FormGroup[];
  }

  get indicadoresFormArray(): FormArray {
    return this.indicadoresService.indicadoresFormArray;
  }

}
