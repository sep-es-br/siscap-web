import { Component, OnInit, Renderer2 } from '@angular/core';

import { BehaviorSubject, finalize, Observable, tap } from 'rxjs';

import { OrganizacoesService } from '../../shared/services/organizacoes/organizacoes.service';

import { IHttpGetRequestBody } from '../../shared/interfaces/http/http-get.interface';
import { IOrganizacaoTableData } from '../../shared/interfaces/organizacao.interface';
import { IPagination } from '../../shared/interfaces/pagination.interface';

@Component({
  selector: 'siscap-organizacoes',
  standalone: false,
  templateUrl: './organizacoes.component.html',
  styleUrl: './organizacoes.component.scss',
})
export class OrganizacoesComponent implements OnInit {
  private _pageConfig: IHttpGetRequestBody = {
    page: 0,
    search: '',
    size: 15,
    sort: '',
  };

  private _organizacoesList$: BehaviorSubject<Array<IOrganizacaoTableData>> =
    new BehaviorSubject<Array<IOrganizacaoTableData>>([]);

  public get organizacoesList$(): Observable<Array<IOrganizacaoTableData>> {
    return this._organizacoesList$;
  }

  public loading: boolean = true;

  public paginacaoData: IPagination = {
    paginaAtual: 1,
    itensPorPagina: 15,
    primeiroItemPagina: 0,
    ultimoItemPagina: 0,
    totalRegistros: 0,
  };

  constructor(
    private _organizacoesService: OrganizacoesService,
    private _r2: Renderer2
  ) {}

  ngOnInit(): void {
    this.fetchPage();
  }

  public filtroPesquisaOutputEvent(filtro: string | null): void {
    this._pageConfig.search = filtro ?? '';
    this.limparSortColumn();
    this.fetchPage();
  }

  public sortableDirectiveOutputEvent(event: string): void {
    this.fetchPage({ sort: event });
  }

  public paginacaoOutputEvent(event: number): void {
    this.fetchPage({ page: event - 1 });
  }

  private fetchPage(pageConfigParam?: {
    [K in keyof IHttpGetRequestBody]?: IHttpGetRequestBody[K];
  }): void {
    const tempPageConfig = { ...this._pageConfig, ...pageConfigParam };

    this._organizacoesService
      .getAllPaged(tempPageConfig)
      .pipe(
        tap((response) => {
          this._organizacoesList$.next(response.content);

          this.paginacaoData = {
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
