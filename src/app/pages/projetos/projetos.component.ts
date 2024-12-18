import { Component, OnDestroy, OnInit, Renderer2 } from '@angular/core';

import { BehaviorSubject, finalize, Observable, tap } from 'rxjs';

import { ProjetosService } from '../../core/services/projetos/projetos.service';

import { IHttpGetRequestBody } from '../../core/interfaces/http/http-get.interface';
import {
  IProjetoFiltroPesquisa,
  IProjetoTableData,
} from '../../core/interfaces/projeto.interface';
import { IPaginacaoDados } from '../../core/interfaces/paginacao-dados.interface';
import { BreadcrumbService } from '../../core/services/breadcrumb/breadcrumb.service';
import { IBreadcrumbBotaoAcao } from '../../core/interfaces/breadcrumb.interface';
import {
  BreadcrumbAcoesEnum,
  BreadcrumbContextoEnum,
} from '../../core/enums/breadcrumb.enum';

@Component({
  selector: 'siscap-projetos',
  standalone: false,
  templateUrl: './projetos.component.html',
  styleUrl: './projetos.component.scss',
})
export class ProjetosComponent implements OnInit, OnDestroy {
  private _pageConfig: IHttpGetRequestBody = {
    page: 0,
    size: 15,
    sort: '',
  };

  private projetoFiltroPesquisa: IProjetoFiltroPesquisa = {
    siglaOuTitulo: '',
    idOrganizacao: 0,
    status: 'Status',
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
    private readonly _breadcrumbService: BreadcrumbService,
    private readonly _projetosService: ProjetosService,
    private readonly _r2: Renderer2
  ) {
    const botoesAcao: IBreadcrumbBotaoAcao = {
      botoes: [BreadcrumbAcoesEnum.Criar],
      contexto: BreadcrumbContextoEnum.Projetos,
    };

    this._breadcrumbService.breadcrumbBotoesAcao$.next(botoesAcao);
  }

  ngOnInit(): void {
    this.fetchPage();
  }

  public redefinirFiltroPesquisa(event: IProjetoFiltroPesquisa): void {
    this.projetoFiltroPesquisa = event;

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

    const searchFilter = this.projetoFiltroPesquisa;

    this._projetosService
      .getAllPaged(tempPageConfig, searchFilter)
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

  ngOnDestroy(): void {
    this._breadcrumbService.limparBotoesAcao();
  }
}
