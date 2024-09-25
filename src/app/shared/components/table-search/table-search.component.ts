import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'siscap-table-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './table-search.component.html',
  styleUrl: './table-search.component.scss',
})
export class TableSearchComponent {
  public textInputPlaceholder = input<string>('Pesquisar');
  public filtroPesquisaOutput = output<string | null>();

  public filtroPesquisa: string | null = null;

  constructor() {}

  public aplicarFiltroPesquisa() {
    this.filtroPesquisaOutput.emit(this.filtroPesquisa);
  }

  public limparFiltroPesquisa() {
    this.filtroPesquisa = null;
    this.aplicarFiltroPesquisa();
  }
}
