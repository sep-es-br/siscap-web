import { Component, Input } from '@angular/core';
import { BotaoPropriedadesModel } from '../../components/botao/botao.model';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastService } from '../../../core/services/toast/toast.service';
import { BotoesConfig } from '../../components/botao/botao.config';
import { BotaoComponent } from "../../components/botao/botao.component";

@Component({
  selector: 'app-confirmation-modal',
  standalone: true,
  imports: [BotaoComponent],
  templateUrl: './confirmation-modal.component.html',
  styleUrl: './confirmation-modal.component.scss'
})
export class ConfirmationModalComponent {
  @Input() public conteudo: string = 'placeholder';

  botaoCancelar: BotaoPropriedadesModel;

  botaoProsseguir: BotaoPropriedadesModel;

  constructor(
    public activeModal: NgbActiveModal,
    private readonly _toastService: ToastService
  ) {
    this.botaoCancelar = BotoesConfig.gerarBotaoPropriedades('cancelar');
    this.botaoProsseguir = BotoesConfig.gerarBotaoPropriedades('confirmar');
  }
}
