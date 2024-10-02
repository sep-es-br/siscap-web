import { Component, OnInit, Renderer2 } from '@angular/core';

import { BehaviorSubject, finalize, Observable, tap } from 'rxjs';

import { ProjetosService } from '../../core/services/projetos/projetos.service';

import { IHttpGetRequestBody } from '../../core/interfaces/http/http-get.interface';
import { IProjetoTableData } from '../../core/interfaces/projeto.interface';
import { IPaginacaoDados } from '../../core/interfaces/paginacao-dados.interface';

@Component({
  selector: 'siscap-projetos',
  standalone: false,
  templateUrl: './projetos.component.html',
  styleUrl: './projetos.component.scss',
})
export class ProjetosComponent implements OnInit {
  private _pageConfig: IHttpGetRequestBody = {
    page: 0,
    search: '',
    size: 15,
    sort: '',
  };

  private _projetosList$: BehaviorSubject<Array<IProjetoTableData>> =
    new BehaviorSubject<Array<IProjetoTableData>>([]);

  public get projetosList$(): Observable<Array<IProjetoTableData>> {
    return this._projetosList$;
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
    private _projetosService: ProjetosService,
    private _r2: Renderer2
  ) {}

  ngOnInit(): void {
    this.fetchPage();
  }

  public filtroPesquisaOutputEvent(filtro: string | null): void {
    if (filtro) {
      this._pageConfig.search = filtro;
    } else {
      this._pageConfig.search = '';
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

    this._projetosService
      .getAllPaged(tempPageConfig)
      .pipe(
        tap((response) => {
          this._projetosList$.next(response.content);

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
