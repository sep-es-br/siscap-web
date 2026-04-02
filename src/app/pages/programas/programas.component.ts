import { Component, OnDestroy, OnInit, Renderer2 } from '@angular/core';

import {
  BehaviorSubject,
  catchError,
  EMPTY,
  finalize,
  Observable,
  Subscription,
  tap,
} from 'rxjs';

import { BreadcrumbService } from '../../core/services/breadcrumb/breadcrumb.service';
import { ProgramasService } from '../../core/services/programas/programas.service';
import { NavegacaoService } from '../../core/services/navegacao/navegacao.service';

import {
  IProgramaFiltroPesquisa,
  IProgramaTableData,
  StatusPrograma,
} from '../../core/interfaces/programa.interface';
import { IPaginacaoDados } from '../../core/interfaces/paginacao-dados.interface';
import { IHttpGetRequestBody } from '../../core/interfaces/http-get-all-paged.interface';

import {
  BreadcrumbAcoesEnum,
  BreadcrumbContextoEnum,
} from '../../core/enums/breadcrumb.enum';

@Component({
  selector: 'siscap-programas',
  standalone: false,
  templateUrl: './programas.component.html',
  styleUrl: './programas.component.scss',
})
export class ProgramasComponent implements OnInit, OnDestroy {
  private readonly _subscription: Subscription = new Subscription();

  private readonly _pageConfig: IHttpGetRequestBody = {
    page: 0,
    size: 15,
    sort: '',
  };

  private filtroAtual: IProgramaFiltroPesquisa = {};

  private readonly _programasList$: BehaviorSubject<Array<IProgramaTableData>> =
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
    private readonly _breadcrumbService: BreadcrumbService,
    private readonly _programasService: ProgramasService,
    private readonly _navegacaoService: NavegacaoService,
    private readonly _r2: Renderer2
  ) {
    this._breadcrumbService.listaBotaoAcaoPropriedades$.next(
      this._programasService.gerarBotoesAcaoListagem()
    );

    this._subscription.add(
      this._breadcrumbService.executarAcaoBotao$.subscribe((acao) => {
        if (acao === BreadcrumbAcoesEnum.Criar)
          this._navegacaoService.navegacaoSimples(
            BreadcrumbContextoEnum.Programas,
            BreadcrumbAcoesEnum.Criar
          );
      })
    );
  }

  ngOnInit(): void {
    this.fetchPage();
  }

  ngOnDestroy(): void {
    this._subscription.unsubscribe();
    this._breadcrumbService.listaBotaoAcaoPropriedades$.next([]);
  }

  filtrarPesquisaProgramas(novoFiltro: IProgramaFiltroPesquisa) {
    this.filtroAtual = novoFiltro;

    if (!novoFiltro.porTermo || !novoFiltro.status) {
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

    const searchFilter = {
      search: this.filtroAtual?.porTermo == undefined ? '' : this.filtroAtual?.porTermo,
      status: this.filtroAtual?.status == undefined ? -1 : this.filtroAtual?.status,
    };

    const cleanFilter = Object.fromEntries(
      Object.entries(searchFilter).filter(
        ([_, v]) => v !== undefined && v !== null && v !== ''
      )
    );

    this._programasService
      .getAllPaged(tempPageConfig, cleanFilter)
      .pipe(
        tap((response) => {
          this._programasList$.next(response?.content ?? []);

          const pageable = response?.pageable;
          const offset = pageable?.offset ?? 0;

          this.paginacaoDados = {
            paginaAtual: (pageable?.pageNumber ?? 0) + 1,
            itensPorPagina: pageable?.pageSize ?? 0,
            primeiroItemPagina: offset + 1,
            ultimoItemPagina: offset + (response?.numberOfElements ?? 0),
            totalRegistros: response?.totalElements ?? 0,
          };
        }),
        catchError((error) => {
          console.error('Erro ao buscar programas:', error);
          this._programasList$.next([]);
          return EMPTY;
        }),
        finalize(() => (this.loading = false))
      )
      .subscribe();
    // this._programasService
    //   .getAllPaged(tempPageConfig, searchFilter)
    //   .pipe(
    //     tap((response) => {
    //       this._programasList$.next(response.content);
    //       console.log('dados passados', response.content);
    //       this.paginacaoDados = {
    //         paginaAtual: response.pageable.pageNumber + 1,
    //         itensPorPagina: response.pageable.pageSize,
    //         primeiroItemPagina: response.pageable.offset + 1,
    //         ultimoItemPagina:
    //           response.pageable.offset + response.numberOfElements,
    //         totalRegistros: response.totalElements,
    //       };
    //     }),
    //     finalize(() => (this.loading = false))
    //   )
    //   .subscribe();
  }

  private limparSortColumn(): void {
    document.querySelectorAll('th[ng-reflect-sortable]').forEach((el) => {
      this._r2.removeClass(el, 'asc');
      this._r2.removeClass(el, 'desc');
    });
  }
}
