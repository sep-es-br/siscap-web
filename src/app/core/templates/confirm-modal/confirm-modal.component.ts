import { Component, Input } from '@angular/core';

import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'confirm-modal-template',
  standalone: false,
  templateUrl: './confirm-modal.component.html',
  styleUrl: './confirm-modal.component.scss',
})
export class ConfirmModalComponent {
  @Input() type!: string; // Utilizar tipo para configurar classes CSS
  @Input() modalData!: any;

  public confirmModalInstance: NgbActiveModal;

  constructor(private _activeModal: NgbActiveModal) {
    this.confirmModalInstance = this._activeModal;
  }
}
