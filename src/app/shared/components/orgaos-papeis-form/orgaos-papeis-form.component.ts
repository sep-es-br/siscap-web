import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IPapeisOrgaoProgramaDropdownOpcoes } from '../../../core/interfaces/opcoes-dropdown.interface';
import { NgSelectModule } from '@ng-select/ng-select';
import { PapelOrgaoPrograma } from '../../../core/enums/orgaos.enum';
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

  @Output() selecaoOrgaos = new EventEmitter<Array<IPapeisOrgaoProgramaDropdownOpcoes>>();

  tiposPapelOrgaoPrograma: Array<string> = [
    PapelOrgaoPrograma.GESTOR,
    PapelOrgaoPrograma.EXECUTOR,
  ];

  emitirNovoValor(): void {
    this.selecaoOrgaos.emit(this.orgaosSelecionados);
  }

  removerOrgao(index: number) {
    this.orgaosSelecionados = this.orgaosSelecionados.filter((el, idx) => idx !== index);
    this.emitirNovoValor();
  }
}
