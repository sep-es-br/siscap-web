import { Component, Input } from '@angular/core';

import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'programa-projeto-proposto-vinculado-warning-modal',
  standalone: false,
  templateUrl:
    './programa-projeto-proposto-vinculado-warning-modal.component.html',
  styleUrls: [
    './programa-projeto-proposto-vinculado-warning-modal.component.scss',
  ],
})
export class ProgramaProjetoPropostoVinculadoWarningModalComponent {
  @Input() public nomeProjeto: string = 'placeholder';
  @Input() public nomePrograma: string = 'placeholder';

  constructor(public activeModal: NgbActiveModal) {}
}
