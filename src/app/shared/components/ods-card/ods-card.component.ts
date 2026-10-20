import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MENSAGENS } from '../../../core/utils/constants';

@Component({
  selector: 'siscap-ods-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ods-card.component.html',
  styleUrl: './ods-card.component.scss',
  host: { '[class.ods-card-sugerido]': 'variante === "sugerido"' }
})
export class OdsCardComponent {
  @Input() numero: number | string = '';
  @Input() nome = '';
  @Input() descricao = '';
  @Input() cor: string | null | undefined;
  @Input() variante: 'sugerido' | 'selecionado' = 'sugerido';
  @Input() desabilitado = false;
  @Input() indicadores: readonly { nomeIndicador: string }[] = [];
  @Output() adicionar = new EventEmitter<void>();
  @Output() remover = new EventEmitter<void>();
  readonly MENSAGENS = MENSAGENS;

  executar(acao: 'adicionar' | 'remover'): void {
    if (!this.desabilitado) this[acao].emit();
  }
}
