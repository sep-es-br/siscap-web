import { Component, OnInit, Renderer2 } from '@angular/core';

import { BehaviorSubject, finalize, Observable, tap } from 'rxjs';

import { PessoasService } from '../../core/services/pessoas/pessoas.service';

import { IHttpGetRequestBody } from '../../core/interfaces/http/http-get.interface';
import { IPessoaTableData } from '../../core/interfaces/pessoa.interface';
import { IPaginacaoDados } from '../../core/interfaces/paginacao-dados.interface';

@Component({
  selector: 'siscap-pessoas',
  standalone: false,
  templateUrl: './pessoas.component.html',
  styleUrl: './pessoas.component.scss',
})
export class PessoasComponent implements OnInit {
  private _pageConfig: IHttpGetRequestBody = {
    page: 0,
    search: '',
    size: 15,
    sort: '',
  };

  private _pessoasList$: BehaviorSubject<Array<IPessoaTableData>> =
    new BehaviorSubject<Array<IPessoaTableData>>([]);

  public get pessoasList$(): Observable<Array<IPessoaTableData>> {
    return this._pessoasList$;
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
    private _pessoasService: PessoasService,
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

    this._pessoasService
      .getAllPaged(tempPageConfig)
      .pipe(
        tap((response) => {
          this._pessoasList$.next(response.content);

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
