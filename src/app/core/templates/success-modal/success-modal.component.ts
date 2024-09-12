import { Component, Input } from '@angular/core';

import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'success-modal',
  standalone: false,
  templateUrl: './success-modal.component.html',
  styleUrls: ['./success-modal.component.scss'],
})
export class SuccessModalComponent {
  @Input() public conteudo: string = 'placeholder';

  constructor(public activeModal: NgbActiveModal) {}
}
