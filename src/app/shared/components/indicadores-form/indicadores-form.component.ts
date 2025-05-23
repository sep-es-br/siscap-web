import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgbTooltipModule, NgbModalModule, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { IndicadoresService } from '../../../core/services/indicadores/indicadores.service';
import { TemplatesModule } from '../../templates/templates.module';
import { COLECAO_TEXTO_TOOLTIP_FORMULARIO_PROJETO } from '../../../core/utils/constants';
import { TipoStatusEnum } from '../../../core/enums/tipo-status.enum';
import { ToastService } from '../../../core/services/toast/toast.service';

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

  public TipoStatusEnum = TipoStatusEnum;

  constructor(
    public indicadoresService: IndicadoresService,
    private readonly _toastService: ToastService,
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

  public marcarIndicadorExcluido(
      index: number
  ) {

    const indicadorFormGroup = this.indicadoresService.indicadoresFormArray.at(index) as FormGroup;
    
    indicadorFormGroup.get('idStatus')?.setValue(TipoStatusEnum.Inativo);
    
    const tipoIndicador = indicadorFormGroup.get('tipoIndicador')?.value || 'Indicador';
    const descricaoIndicador = indicadorFormGroup.get('descricaoIndicador')?.value || '';
    
    this._toastService.showToast(
        'info',
        'Indicador removido do projeto.',
        [
            `${tipoIndicador}`,
            `${descricaoIndicador.substring(0, 50)}${descricaoIndicador.length > 50 ? '...' : ''}`
        ]
    );
            
  }

  public isNovoMembro(index: number): boolean {
    return !this.indicadoresService.indicadoresFormArraySnapshot.some(
      (membro) => 
        membro.idIndicador ===
        this.indicadoresService.indicadoresFormArray.at(index).value.idIndicador
    );
  }

  public isIndicadorAtivo(index: number): boolean {
    const indicadorFormGroup = this.indicadoresService.indicadoresFormArray.at(index);
    return indicadorFormGroup.get('idStatus')?.value !== 2;
  }

  get indicadoresFormGroups(): FormGroup[] {
    return this.indicadoresFormArray.controls as FormGroup[];
  }

  get indicadoresFormArray(): FormArray {
    return this.indicadoresService.indicadoresFormArray;
  }

}
