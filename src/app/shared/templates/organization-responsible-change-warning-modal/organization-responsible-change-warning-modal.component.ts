import { Component, Input } from '@angular/core';

import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { BotaoPropriedadesModel } from '../../components/botao/botao.model';

import { BotoesConfig } from '../../components/botao/botao.config';

@Component({
  selector: 'organization-responsible-change-warning-modal',
  standalone: false,
  templateUrl: './organization-responsible-change-warning-modal.component.html',
  styleUrls: ['./organization-responsible-change-warning-modal.component.scss'],
})
export class OrganizationResponsibleChangeWarningModalComponent {
  @Input() public conteudo: string = 'placeholder';

  public botaoEntendi: BotaoPropriedadesModel;

  constructor(public activeModal: NgbActiveModal) {
    this.botaoEntendi = BotoesConfig.gerarBotaoPropriedades('confirmar', {
      texto: 'Entendi',
    });
  }
}
