import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { MENSAGENS } from '../../../core/utils/constants';
import { TemplatesModule } from '../../templates/templates.module';

export interface AcaoPlanejamentoOpcao {
  id: number;
  nome: string;
  selecionada: boolean;
}

@Component({
  selector: 'siscap-selecao-acoes-planejamento',
  standalone: true,
  imports: [CommonModule, FormsModule, CheckboxModule, InputTextModule, TemplatesModule],
  templateUrl: './selecao-acoes-planejamento.component.html',
  styleUrl: './selecao-acoes-planejamento.component.scss',
})
export class SelecaoAcoesPlanejamentoComponent {
  @Input() acoes: readonly AcaoPlanejamentoOpcao[] = [];
  @Input() possuiAcoes = false;
  @Input() carregando = false;
  @Input() podeEditar = false;
  @Input() todosSelecionados = false;
  @Input() filtroTexto = '';
  @Input() textoAjuda = '';
  @Output() buscaAlterada = new EventEmitter<string>();
  @Output() selecionarTodos = new EventEmitter<boolean>();
  @Output() alternarAcao = new EventEmitter<AcaoPlanejamentoOpcao>();
  @ViewChild('searchInput') searchInput?: ElementRef<HTMLInputElement>;
  readonly MENSAGENS = MENSAGENS;
  searchVisible = false;

  trackByAcao(_: number, acao: AcaoPlanejamentoOpcao): number {
    return acao.id;
  }

  toggleSearch(): void {
    if (!this.podeEditar) return;
    this.searchVisible = !this.searchVisible;
    if (this.searchVisible) setTimeout(() => this.searchInput?.nativeElement.focus());
  }

  limparBusca(): void {
    if (!this.podeEditar) return;
    this.buscaAlterada.emit('');
    this.searchInput?.nativeElement.focus();
  }
}