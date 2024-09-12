import { Component, Input } from '@angular/core';

import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'delete-modal',
  standalone: false,
  templateUrl: './delete-modal.component.html',
  styleUrls: ['./delete-modal.component.scss'],
})
export class DeleteModalComponent {
  @Input() public conteudo: string = 'placeholder';

  constructor(public activeModal: NgbActiveModal) {}
}
