import { Component, OnInit, Renderer2 } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OrganizacoesService } from '../../../shared/services/organizacoes/organizacoes.service';
import {
  IHttpGetRequestBody,
  IHttpGetResponseBody,
} from '../../../shared/interfaces/http/http-get.interface';
import { BehaviorSubject, distinct, Observable, of, tap } from 'rxjs';
import { IOrganizacaoTableData } from '../../../shared/interfaces/organizacao.interface';
import { SortColumn } from '../../../core/directives/sortable/sortable.directive';

@Component({
  selector: 'siscap-organizacoes-list',
  standalone: false,
  templateUrl: './organizacoes-list.component.html',
  styleUrl: './organizacoes-list.component.scss',
})
export class OrganizacoesListComponent implements OnInit {
  private _organizacoesList$: BehaviorSubject<Array<IOrganizacaoTableData>> =
    new BehaviorSubject<Array<IOrganizacaoTableData>>([]);

  public get organizacoesList$(): Observable<Array<IOrganizacaoTableData>> {
    return this._organizacoesList$;
  }

  public pageConfig: IHttpGetRequestBody = {
    page: 0,
    search: '',
    size: 15,
    sort: '',
  };

  public primeiroItemPagina: number = 0;
  public ultimoItemPagina: number = 0;
  public totalRegistros: number = 0;

  constructor(
    private _router: Router,
    private _route: ActivatedRoute,
    private _organizacoesService: OrganizacoesService,
    private _r2: Renderer2
  ) {}

  ngOnInit(): void {
    this.pageConfigChange();
  }

  /*
    1. ENTENDER QUESTÃO NgbPagination.page MELHOR
      |-> PAGEABLE DO JAVA REQUER 0, MAS DEFAULT DO NGBPAGINATION E 1!!!
    2. IMPLEMENTAR SORT POR COLUNA
    3. IMPLEMENTA PESQUISA (SIMPLES? AVANÇADA? OS DOIS?)

    * VER COMO CONTROLAR O ESTADO DE pageConfig
  */

  public ngbPaginationPageChangeEvent(event: number): void {
    this.pageConfigChange({ page: event - 1 });
  }

  public sortableDirectiveEvent(event: SortColumn): void {
    this.pageConfigChange({ sort: `${event.column},${event.direction}` });
  }

  private pageConfigChange(pageConfigParam?: {
    [K in keyof IHttpGetRequestBody]?: IHttpGetRequestBody[K];
  }): void {
    // console.log('dentro de pageConfigChange');

    console.log('pageConfig padrão');
    console.log(this.pageConfig);

    console.log('parametros de pageConfig');
    console.log(pageConfigParam);

    if (pageConfigParam && !pageConfigParam['sort']) {
      this.limparSortColumn();
    }

    const tempPageConfig = { ...this.pageConfig, ...pageConfigParam };

    // console.log('tempPageConfig');
    // console.log(tempPageConfig);

    this._organizacoesService
      .getAllPaged(tempPageConfig)
      .pipe(
        tap((response) => {
          console.log(response);

          this._organizacoesList$.next(response.content);

          // this.pageConfig.page = response.pageable.pageNumber;
          // this.pageConfig.size = response.pageable.pageSize;
          // this.pageConfig.sort = `${
          //   response.pageable.sort[0].property
          // },${response.pageable.sort[0].direction.toLowerCase()}`;

          this.primeiroItemPagina = response.pageable.offset + 1;
          this.ultimoItemPagina =
            response.pageable.offset + response.numberOfElements;
          this.totalRegistros = response.totalElements;
        })
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
