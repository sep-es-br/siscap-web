import { Component, Input } from '@angular/core';

import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { BotaoPropriedadesModel } from '../../components/botao/botao.model';

import { BotoesConfig } from '../../components/botao/botao.config';

@Component({
  selector: 'delete-modal',
  standalone: false,
  templateUrl: './delete-modal.component.html',
  styleUrls: ['./delete-modal.component.scss'],
})
export class DeleteModalComponent {
  @Input() public conteudo: string = 'placeholder';

  public botaoVoltar: BotaoPropriedadesModel;
  public botaoProsseguir: BotaoPropriedadesModel;

  constructor(public activeModal: NgbActiveModal) {
    this.botaoVoltar = BotoesConfig.gerarBotaoPropriedades('voltar');

    this.botaoProsseguir = BotoesConfig.gerarBotaoPropriedades('deletar', {
      icone: ['fa-solid', 'fa-triangle-exclamation'],
      texto: 'Prosseguir',
    });
  }
}
