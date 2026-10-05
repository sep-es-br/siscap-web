import { MENSAGENS } from '../../../core/utils/constants';
import { NgClass } from '@angular/common';
import { Component, EventEmitter, HostBinding, Input, Output, inject } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'siscap-modal',
  standalone: true,
  imports: [NgClass],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.scss',
})
export class ModalComponent {
  @Input() titulo: string = 'Título';
  @Input() tamanhoCard: 'padrao' | 'amplo' = 'padrao';

  @HostBinding('attr.data-tamanho-card')
  get atributoTamanhoCard(): string {
    return this.tamanhoCard;
  }

  @Input() headerClasses?: string;
  @Input() cabecalhoPersonalizado = false;
  @Input() exibirFecharCabecalho = true;

  @Output() fecharModal = new EventEmitter<void>();

  public activeModal = inject(NgbActiveModal, { optional: true });

  fechar(): void {
    this.fecharModal.emit();
    this.activeModal?.dismiss('fechar');
  }
}
