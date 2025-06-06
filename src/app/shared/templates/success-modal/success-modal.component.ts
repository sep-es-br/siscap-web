import { Component, Input } from '@angular/core';

import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { BotaoPropriedadesModel } from '../../components/botao/botao.model';
import { BotoesConfig } from '../../components/botao/botao.config';

@Component({
  selector: 'success-modal',
  standalone: false,
  templateUrl: './success-modal.component.html',
  styleUrls: ['./success-modal.component.scss'],
})
export class SuccessModalComponent {
  @Input() public conteudo: string = 'placeholder';

  public botaoOK: BotaoPropriedadesModel;

  constructor(public activeModal: NgbActiveModal) {
    this.botaoOK = BotoesConfig.gerarBotaoPropriedades('confirmar', {
      texto: 'OK',
    });
  }
}
