import { Component, OnInit, Renderer2 } from '@angular/core';

import { BehaviorSubject, finalize, Observable, tap } from 'rxjs';

import { ProgramasService } from '../../core/services/programas/programas.service';

import { IHttpGetRequestBody } from '../../core/interfaces/http/http-get.interface';
import { IProgramaTableData } from '../../core/interfaces/programa.interface';
import { IPaginacaoDados } from '../../core/interfaces/paginacao-dados.interface';

@Component({
  selector: 'siscap-programas',
  standalone: false,
  templateUrl: './programas.component.html',
  styleUrl: './programas.component.scss',
})
export class ProgramasComponent implements OnInit {
  private _pageConfig: IHttpGetRequestBody = {
    page: 0,
    search: '',
    size: 15,
    sort: '',
  };

  private _programasList$: BehaviorSubject<Array<IProgramaTableData>> =
    new BehaviorSubject<Array<IProgramaTableData>>([]);

  public get programasList$(): Observable<Array<IProgramaTableData>> {
    return this._programasList$;
  }

  public loading: boolean = true;

  public paginacaoDados: IPaginacaoDados = {
    paginaAtual: 1,
    itensPorPagina: 15,
    primeiroItemPagina: 0,
    ultimoItemPagina: 0,
    totalRegistros: 0,
  };

  constructor(
    private _programasService: ProgramasService,
    private _r2: Renderer2
  ) {}

  ngOnInit(): void {
    this.fetchPage();
  }

  public filtroPesquisaOutputEvent(filtro: string): void {
    this._pageConfig.search = filtro;

    if (!filtro) {
      this._pageConfig.sort = '';
      this.limparSortColumn();
    }

    this.fetchPage();
  }

  public sortableDirectiveOutputEvent(event: string): void {
    this._pageConfig.sort = event;
    this.fetchPage();
  }

  public paginacaoOutputEvent(event: number): void {
    this.fetchPage({ page: event - 1 });
  }

  private fetchPage(pageConfigParam?: {
    [K in keyof IHttpGetRequestBody]?: IHttpGetRequestBody[K];
  }): void {
    const tempPageConfig = { ...this._pageConfig, ...pageConfigParam };

    this._programasService
      .getAllPaged(tempPageConfig)
      .pipe(
        tap((response) => {
          this._programasList$.next(response.content);

          this.paginacaoDados = {
            paginaAtual: response.pageable.pageNumber + 1,
            itensPorPagina: response.pageable.pageSize,
            primeiroItemPagina: response.pageable.offset + 1,
            ultimoItemPagina:
              response.pageable.offset + response.numberOfElements,
            totalRegistros: response.totalElements,
          };
        }),
        finalize(() => (this.loading = false))
      )
      .subscribe();
  }

  private limparSortColumn(): void {
    document.querySelectorAll('th[ng-reflect-sortable]').forEach((el) => {
      this._r2.removeClass(el, 'asc');
      this._r2.removeClass(el, 'desc');
    });
  }
}
