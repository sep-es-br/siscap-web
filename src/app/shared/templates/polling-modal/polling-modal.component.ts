import { MENSAGENS } from '../../../core/utils/constants';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
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
export class PollingModalComponent implements OnChanges {
  public readonly MENSAGENS = MENSAGENS;

 @Input() fasesPolling: Array<IPollingFasesForm> = [];
 @Input() tamanhoCard: 'padrao' | 'amplo' = 'padrao';
 @Input() mensagemSucesso = '';

  get etapasFinalizadas(): boolean {
    return this.fasesPolling.length > 0 && this.fasesPolling.every(fase => fase.finalizada);
  }

  botaoFechar: BotaoPropriedadesModel;

  constructor(public activeModal: NgbActiveModal) {
    this.botaoFechar = BotoesConfig.gerarBotaoPropriedades('fechar');
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes && changes['fasesPolling']) {
      // console.log('this.fasesPolling: ', this.fasesPolling);
    }
  }
}
