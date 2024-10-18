import { Component, Renderer2 } from '@angular/core';

import { BehaviorSubject, finalize, Observable, tap } from 'rxjs';

import { CartasConsultaService } from '../../core/services/cartas-consulta/cartas-consulta.service';

import { IHttpGetRequestBody } from '../../core/interfaces/http/http-get.interface';
import { ICartaConsultaTableData } from '../../core/interfaces/carta-consulta.interface';
import { IPaginacaoDados } from '../../core/interfaces/paginacao-dados.interface';

@Component({
  selector: 'siscap-cartas-consulta',
  standalone: false,
  templateUrl: './cartas-consulta.component.html',
  styleUrl: './cartas-consulta.component.scss',
})
export class CartasConsultaComponent {
  private _pageConfig: IHttpGetRequestBody = {
    page: 0,
    search: '',
    size: 15,
    sort: '',
  };

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
    private _cartasConsultaService: CartasConsultaService,
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

    this._cartasConsultaService
      .getAllPaged(tempPageConfig)
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
}
