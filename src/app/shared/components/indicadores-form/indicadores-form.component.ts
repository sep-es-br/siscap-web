import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgbTooltipModule, NgbModalModule, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { IndicadoresService } from '../../../core/services/indicadores/indicadores.service';

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
  ],
  templateUrl: './indicadores-form.component.html',
})
export class IndicadoresFormComponent {
  @Input() tiposIndicadorOpcoes: { id: number; nome: string }[] = [];
  @Input() public isModoEdicao: boolean = false;
  @Input() descricaoIndicador: string;
  @Input() descricaoMeta: string;

  constructor(
    public indicadoresService: IndicadoresService,
    private fb: FormBuilder) {
    this.descricaoIndicador = '';
    this.descricaoMeta = '';
  }

  removerIndicador(index: number): void {
    this.indicadoresFormArray.removeAt(index);
  }

  getTipoIndicadorNome(id: number): string {
    return this.tiposIndicadorOpcoes.find((t) => t.id === id)?.nome ?? '';
  }

  get indicadoresFormGroups(): FormGroup[] {
    return this.indicadoresFormArray.controls as FormGroup[];
  }

  get indicadoresFormArray(): FormArray {
    return this.indicadoresService.indicadoresFormArray;
  }

}
