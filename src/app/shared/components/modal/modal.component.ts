import { MENSAGENS } from '../../../core/utils/constants';
import { NgClass } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'siscap-modal',
  standalone: true,
  imports: [NgClass],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.scss',
})
export class ModalComponent {
  public readonly MENSAGENS = MENSAGENS;

  @Input() titulo: string = MENSAGENS.TITULO;

  @Input() headerClasses?: string;

  @Output() fecharModal = new EventEmitter<void>();
}
