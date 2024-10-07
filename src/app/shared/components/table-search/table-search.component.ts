import { CommonModule } from '@angular/common';
import { Component, output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'siscap-table-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './table-search.component.html',
  styleUrl: './table-search.component.scss',
})
export class TableSearchComponent {
  public filtroPesquisaOutput = output<string>();

  public filtroPesquisa: string = '';

  constructor() {}

  public aplicarFiltroPesquisa() {
    this.filtroPesquisaOutput.emit(this.filtroPesquisa);
  }
}
