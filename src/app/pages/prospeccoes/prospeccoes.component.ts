import { Component, Renderer2 } from '@angular/core';

import { BehaviorSubject, finalize, Observable, tap } from 'rxjs';

import { ProspeccoesService } from '../../core/services/prospeccoes/prospeccoes.service';

import { IHttpGetRequestBody } from '../../core/interfaces/http/http-get.interface';
import { IProspeccaoTableData } from '../../core/interfaces/prospeccao.interface';
import { IPaginacaoDados } from '../../core/interfaces/paginacao-dados.interface';

@Component({
  selector: 'siscap-prospeccoes',
  standalone: false,
  templateUrl: './prospeccoes.component.html',
  styleUrl: './prospeccoes.component.scss',
})
export class ProspeccoesComponent {
  private _pageConfig: IHttpGetRequestBody = {
    page: 0,
    search: '',
    size: 15,
    sort: '',
  };

  private _prospeccoesList$: BehaviorSubject<Array<IProspeccaoTableData>> =
    new BehaviorSubject<Array<IProspeccaoTableData>>([]);

  public get prospeccoesList$(): Observable<Array<IProspeccaoTableData>> {
    return this._prospeccoesList$;
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
    private _prospeccoesService: ProspeccoesService,
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

    this._prospeccoesService
      .getAllPaged(tempPageConfig)
      .pipe(
        tap((response) => {
          this._prospeccoesList$.next(response.content);

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
