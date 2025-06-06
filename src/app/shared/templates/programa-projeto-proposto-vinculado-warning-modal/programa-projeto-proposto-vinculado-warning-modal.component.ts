import { Component, Input } from '@angular/core';

import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { BotaoPropriedadesModel } from '../../components/botao/botao.model';

import { BotoesConfig } from '../../components/botao/botao.config';

@Component({
  selector: 'programa-projeto-proposto-vinculado-warning-modal',
  standalone: false,
  templateUrl:
    './programa-projeto-proposto-vinculado-warning-modal.component.html',
  styleUrls: [
    './programa-projeto-proposto-vinculado-warning-modal.component.scss',
  ],
})
export class ProgramaProjetoPropostoVinculadoWarningModalComponent {
  @Input() public nomeProjeto: string = 'placeholder';
  @Input() public nomePrograma: string = 'placeholder';

  public botaoEntendi: BotaoPropriedadesModel;

  constructor(public activeModal: NgbActiveModal) {
    this.botaoEntendi = BotoesConfig.gerarBotaoPropriedades('confirmar', {
      texto: 'Entendi',
    });
  }
}
