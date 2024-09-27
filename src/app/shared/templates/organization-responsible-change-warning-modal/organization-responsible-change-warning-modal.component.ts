import { Component, Input } from '@angular/core';

import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'organization-responsible-change-warning-modal',
  standalone: false,
  templateUrl: './organization-responsible-change-warning-modal.component.html',
  styleUrls: ['./organization-responsible-change-warning-modal.component.scss'],
})
export class OrganizationResponsibleChangeWarningModalComponent {
  @Input() public conteudo: string = 'placeholder';

  constructor(public activeModal: NgbActiveModal) {}
}
