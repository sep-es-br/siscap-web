import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgbTooltipModule, NgbModalModule, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';

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

  indicadoresFormArray: FormArray<FormGroup>;

  constructor(private fb: FormBuilder) {
    this.indicadoresFormArray = this.fb.array<FormGroup>([]);
  }

  onSelecionarTipoIndicador(idTipo: number): void {
    const tipoSelecionado = this.tiposIndicadorOpcoes.find(t => t.id === idTipo);
    if (!tipoSelecionado) return;

    const novoIndicador = this.fb.group({
      idTipoIndicador: [idTipo, Validators.required],
      descricao: ['', Validators.required],
      meta: ['', Validators.required]
    });

    this.indicadoresFormArray.push(novoIndicador);
  }

  removerIndicador(index: number): void {
    this.indicadoresFormArray.removeAt(index);
  }

  getTipoIndicadorNome(id: number): string {
    return this.tiposIndicadorOpcoes.find((t) => t.id === id)?.nome ?? '';
  }

  // 👇 Aqui está o getter para facilitar no HTML
  get indicadoresFormGroups(): FormGroup[] {
    return this.indicadoresFormArray.controls as FormGroup[];
  }
}
