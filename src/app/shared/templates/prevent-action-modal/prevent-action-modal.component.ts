import { Component, Input } from '@angular/core';

import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { BotaoPropriedadesModel } from '../../components/botao/botao.model';

import { BotoesConfig } from '../../components/botao/botao.config';

@Component({
  selector: 'prevent-action-modal',
  standalone: false,
  templateUrl: './prevent-action-modal.component.html',
  styleUrls: ['./prevent-action-modal.component.scss'],
})
export class PreventActionModalComponent {
  @Input() public conteudo: string = 'placeholder';

  public botaoVoltar: BotaoPropriedadesModel;

  constructor(public activeModal: NgbActiveModal) {
    this.botaoVoltar = BotoesConfig.gerarBotaoPropriedades('voltar');
  }
}
