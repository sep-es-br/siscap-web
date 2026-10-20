import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TooltipModule } from 'primeng/tooltip';
import { PlanejamentoAcao, DetalhamentoOrcamentarioLoa } from '../../../core/interfaces/planejamento-acao.interface';
import { MENSAGENS, formatarMensagem } from '../../../core/utils/constants';

@Component({
  selector: 'siscap-acao-planejamento-card',
  standalone: true,
  imports: [CommonModule, TooltipModule],
  templateUrl: './acao-planejamento-card.component.html',
  styleUrl: './acao-planejamento-card.component.scss',
})
export class AcaoPlanejamentoCardComponent {
  @Input({ required: true }) acao!: PlanejamentoAcao;
  @Input() periodoDescricao: string | null = null;
  @Input() exibirRemocao = false;
  @Input() podeEditar = false;
  @Output() remover = new EventEmitter<void>();

  readonly MENSAGENS = MENSAGENS;
  readonly formatarMensagem = formatarMensagem;
  private readonly moeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

  formatarMoeda(valor: number | null | undefined): string {
    return this.moeda.format(valor ?? 0);
  }

  trackByDetalhamentoLoa(index: number, detalhe: DetalhamentoOrcamentarioLoa): string {
    return `${detalhe.codigoGnd}-${detalhe.codigoModalidade}-${detalhe.idUso}-${detalhe.fonte}-${index}`;
  }

  removerAcao(): void {
    if (this.exibirRemocao && this.podeEditar) this.remover.emit();
  }
}