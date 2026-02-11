import { Component, Input } from '@angular/core';
import { BotaoPropriedadesModel } from '../../components/botao/botao.model';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { BotoesConfig } from '../../components/botao/botao.config';
import { IProgramaAssinaturaFasesForm } from '../../../core/interfaces/programa.interface';

@Component({
  selector: 'app-polling-modal',
  standalone: false,
  templateUrl: './polling-modal.component.html',
  styleUrl: './polling-modal.component.scss'
})
export class PollingModalComponent {
 @Input() fasesPollingAssinatura: Array<IProgramaAssinaturaFasesForm> = [];

  botaoFechar: BotaoPropriedadesModel;

  constructor(public activeModal: NgbActiveModal) {
    this.botaoFechar = BotoesConfig.gerarBotaoPropriedades('fechar');
  }
}
