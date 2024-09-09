import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'siscap-pagination',
  standalone: true,
  imports: [CommonModule, NgbPaginationModule],
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.scss',
})
export class PaginationComponent {
  public paginacaoData = input();

  /*
    ENTENDER COMO PASSAR DADOS DE PAGINAÇÃO DO COMPONENTE PAI
    |-> DESTRINCHAR EM PROPRIEDADES INDIVIDUAIS?
    |-> ARGUMENTO UNICO EM FORMA DE OBJETO?
        |-> INTERFACE IPaginacaoData?
        ex: 
          IPaginacaoData {
            paginaAtual: number;
            itensPorPagina: number;
            primeiroItemPagina: number;
            ultimoItemPagina: number;
            totalRegistros: number;
          }

    CRIAR OUTPUT ENVIANDO DADOS DE MUDANÇA DE PÁGINA
  */

  public paginaAtual: number = 1;
  public itensPorPagina: number = 15;
  public primeiroItemPagina: number = 0;
  public ultimoItemPagina: number = 0;
  public totalRegistros: number = 0;

  constructor() {}

  public ngbPaginationPageChangeEvent(event: number): void {
    console.log(event);
    console.log(this.paginaAtual);
  }
}
