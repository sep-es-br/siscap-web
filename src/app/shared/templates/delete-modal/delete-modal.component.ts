import { Component, Input } from '@angular/core';

import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { BotaoPropriedadesModel } from '../../components/botao/botao.model';

import { BotoesConfig } from '../../components/botao/botao.config';
import { ToastService } from '../../../core/services/toast/toast.service';

@Component({
  selector: 'delete-modal',
  standalone: false,
  templateUrl: './delete-modal.component.html',
  styleUrls: ['./delete-modal.component.scss'],
})
export class DeleteModalComponent {
  @Input() public conteudo: string = 'placeholder';
  @Input() public exigirJustificativa: boolean = false;

  public botaoVoltar: BotaoPropriedadesModel;
  public botaoProsseguir: BotaoPropriedadesModel;
  public justificativa: string;

  constructor(public activeModal: NgbActiveModal,
    private readonly _toastService: ToastService
  ) {
    this.botaoVoltar = BotoesConfig.gerarBotaoPropriedades('voltar');
    this.botaoProsseguir = BotoesConfig.gerarBotaoPropriedades('deletar', {
      icone: ['fa-solid', 'fa-triangle-exclamation'],
      texto: 'Prosseguir',
    });
    this.justificativa = '';
  }

  confirmar() {
    if (this.exigirJustificativa && this.justificativa.length == 0 ) {
      this._toastService.showToast(
        'error',
        'Erro ao prosseguir com exclusão.',
        ['Por favor, preencha a justificativa antes de prosseguir.']
      );
      return;
    }
    this.activeModal.close({
      confirmado: true,
      justificativa: this.justificativa
    });
  }

}
