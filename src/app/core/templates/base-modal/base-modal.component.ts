import { Component, Input } from '@angular/core';

import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

interface IBaseModalProps {
  texto: string;
  background: string;
}

interface IBaseModalTitulo extends IBaseModalProps {}

interface IBaseModalCorpo extends Omit<IBaseModalProps, 'background'> {}

interface IBaseModalRodape extends IBaseModalProps {
  resultado: boolean;
}

@Component({
  selector: 'base-modal',
  standalone: false,
  templateUrl: './base-modal.component.html',
  styleUrls: ['./base-modal.component.scss'],
})
export class BaseModalComponent {
  @Input() public titulo: IBaseModalTitulo = {
    texto: 'Titulo do modal',
    background: 'info-subtle',
  };

  @Input() public corpo: IBaseModalCorpo = {
    texto: 'Texto do corpo do modal',
  };

  @Input() public rodape: Array<IBaseModalRodape> = [
    { texto: 'Cancelar', background: 'secondary', resultado: false },
    { texto: 'Confirmar', background: 'success', resultado: true },
  ];

  constructor(public activeModal: NgbActiveModal) {}
}
