import { Component, OnDestroy, OnInit, Renderer2 } from '@angular/core';

import { BehaviorSubject, finalize, Observable, tap } from 'rxjs';

import { CartasConsultaService } from '../../core/services/cartas-consulta/cartas-consulta.service';
import { BreadcrumbService } from '../../core/services/breadcrumb/breadcrumb.service';

import { IHttpGetRequestBody } from '../../core/interfaces/http/http-get.interface';
import { ICartaConsultaTableData } from '../../core/interfaces/carta-consulta.interface';
import { IPaginacaoDados } from '../../core/interfaces/paginacao-dados.interface';
import { IBreadcrumbBotaoAcao } from '../../core/interfaces/breadcrumb.interface';

import {
  BreadcrumbAcoesEnum,
  BreadcrumbContextoEnum,
} from '../../core/enums/breadcrumb.enum';

@Component({
  selector: 'siscap-cartas-consulta',
  standalone: false,
  templateUrl: './cartas-consulta.component.html',
  styleUrl: './cartas-consulta.component.scss',
})
export class CartasConsultaComponent implements OnInit, OnDestroy {
  private _pageConfig: IHttpGetRequestBody = {
    page: 0,
    size: 15,
    sort: '',
  };

  private termoPesquisaSimples: string = '';

  private _cartasConsultaList$: BehaviorSubject<
    Array<ICartaConsultaTableData>
  > = new BehaviorSubject<Array<ICartaConsultaTableData>>([]);

  public get cartasConsultaList$(): Observable<Array<ICartaConsultaTableData>> {
    return this._cartasConsultaList$;
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
    private readonly _breadcrumbService: BreadcrumbService,
    private readonly _cartasConsultaService: CartasConsultaService,
    private readonly _r2: Renderer2
  ) {
    const botoesAcao: IBreadcrumbBotaoAcao = {
      botoes: [BreadcrumbAcoesEnum.Criar],
      contexto: BreadcrumbContextoEnum.CartasConsulta,
    };

    this._breadcrumbService.breadcrumbBotoesAcao$.next(botoesAcao);
  }

  ngOnInit(): void {
    this.fetchPage();
  }

  public filtroPesquisaOutputEvent(filtro: string): void {
    this.termoPesquisaSimples = filtro;

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

    const searchFilter = { search: this.termoPesquisaSimples };

    this._cartasConsultaService
      .getAllPaged(tempPageConfig, searchFilter)
      .pipe(
        tap((response) => {
          this._cartasConsultaList$.next(response.content);

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

  ngOnDestroy(): void {
    this._breadcrumbService.limparBotoesAcao();
  }
}
