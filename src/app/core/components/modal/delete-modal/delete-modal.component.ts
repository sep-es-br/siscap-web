import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'siscap-delete-modal',
  standalone: false,
  templateUrl: './delete-modal.component.html',
  styleUrl: './delete-modal.component.scss',
})
export class DeleteModalComponent {
  @Input() title!: string;
  @Input() content!: string;

  constructor(public modal: NgbActiveModal) {}
}
