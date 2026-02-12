import { Component, Input } from '@angular/core';
import { BotaoPropriedadesModel } from '../../components/botao/botao.model';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { BotoesConfig } from '../../components/botao/botao.config';
import { IPollingFasesForm } from '../../../core/interfaces/polling.interface';

@Component({
  selector: 'app-polling-modal',
  standalone: false,
  templateUrl: './polling-modal.component.html',
  styleUrl: './polling-modal.component.scss'
})
export class PollingModalComponent {
 @Input() fasesPolling: Array<IPollingFasesForm> = [];

  botaoFechar: BotaoPropriedadesModel;

  constructor(public activeModal: NgbActiveModal) {
    this.botaoFechar = BotoesConfig.gerarBotaoPropriedades('fechar');
  }
}
