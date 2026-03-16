import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { IPapeisOrgaoProgramaDropdownOpcoes } from '../../../core/interfaces/opcoes-dropdown.interface';
import { NgSelectModule } from '@ng-select/ng-select';
import { listaOpcoesPapelOrgaoPrograma, OpcaoPapelOrgaoPrograma, PapelOrgaoPrograma } from '../../../core/enums/orgaos.enum';
import { FormsModule } from '@angular/forms';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'siscap-orgaos-papeis-form',
  standalone: true,
  imports: [
    NgSelectModule,
    FormsModule,
    NgbTooltipModule,
  ],
  templateUrl: './orgaos-papeis-form.component.html',
  styleUrl: './orgaos-papeis-form.component.scss'
})
export class OrgaosPapeisFormComponent {
  @Input() orgaosSelecionados: Array<IPapeisOrgaoProgramaDropdownOpcoes> = [];

  @Output() orgaoRemovido = new EventEmitter<IPapeisOrgaoProgramaDropdownOpcoes>();

  @Output() selecaoOrgaos = new EventEmitter<Array<IPapeisOrgaoProgramaDropdownOpcoes>>();

  tiposPapelOrgaoPrograma: Array<OpcaoPapelOrgaoPrograma> = listaOpcoesPapelOrgaoPrograma;

  removerOrgao(orgao: IPapeisOrgaoProgramaDropdownOpcoes) {
    this.orgaoRemovido.emit(orgao);
  }

  handleNovoValor(selectedValue: PapelOrgaoPrograma, selectedOrgao: IPapeisOrgaoProgramaDropdownOpcoes): void {
    if (selectedValue === PapelOrgaoPrograma.GESTOR && this.orgaosSelecionados.length > 1) {
      this.orgaosSelecionados
        .filter((org) => org.id !== selectedOrgao.id)
        .forEach((org) => org.papel = PapelOrgaoPrograma.EXECUTOR);
    }

    this.selecaoOrgaos.emit(this.orgaosSelecionados);
  }
}
