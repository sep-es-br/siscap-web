import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { IPagination } from '../../../shared/interfaces/pagination.interface';

@Component({
  selector: 'siscap-pagination',
  standalone: true,
  imports: [CommonModule, NgbPaginationModule],
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.scss',
})
export class PaginationComponent {
  public paginacaoInput = input<IPagination>({
    paginaAtual: 1,
    itensPorPagina: 15,
    primeiroItemPagina: 0,
    ultimoItemPagina: 0,
    totalRegistros: 0,
  });

  public paginacaoOutput = output<number>();

  constructor() {}

  public ngbPaginationPageChangeEvent(event: number): void {
    this.paginacaoOutput.emit(event);
  }
}
