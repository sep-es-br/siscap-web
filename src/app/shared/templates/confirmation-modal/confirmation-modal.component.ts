import { Component, Input } from '@angular/core';
import { BotaoPropriedadesModel } from '../../components/botao/botao.model';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { BotoesConfig } from '../../components/botao/botao.config';
import { BotaoComponent } from "../../components/botao/botao.component";
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-confirmation-modal',
  standalone: true,
  imports: [NgClass, BotaoComponent],
  templateUrl: './confirmation-modal.component.html',
  styleUrl: './confirmation-modal.component.scss'
})
export class ConfirmationModalComponent {

  @Input() public config: {

    titulo: string;
    headerCustomClass?: string;
    textoPrincipal: string;
    textoSecundario?: string;
    textoPrincipalCustomClass?: string;
    textoSecundarioCustomClass?: string;

    itensDetalhe?: {
      titulo?: string;
      linhas: {
        titulo: string;
        descricao?: string;
      }[];
    };

  } = {
      titulo: 'Título',
      textoPrincipal: 'Conteúdo',
      textoPrincipalCustomClass: 'fw-bold',
    };

  botaoCancelar: BotaoPropriedadesModel;

  botaoProsseguir: BotaoPropriedadesModel;

  constructor(
    public activeModal: NgbActiveModal,
  ) {
    this.botaoCancelar = BotoesConfig.gerarBotaoPropriedades('cancelar');
    this.botaoProsseguir = BotoesConfig.gerarBotaoPropriedades('confirmar');
  }
}
