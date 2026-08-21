import { Component, OnDestroy, OnInit, Renderer2 } from '@angular/core';

import { BehaviorSubject, finalize, Observable, Subject, Subscription, takeUntil, tap } from 'rxjs';

// import { UsuarioService } from '../../core/services/usuario/usuario.service';
import { BreadcrumbService } from '../../core/services/breadcrumb/breadcrumb.service';
import { ProjetosService } from '../../core/services/projetos/projetos.service';
import { NavegacaoService } from '../../core/services/navegacao/navegacao.service';

import {
  IProjetoFiltroPesquisa,
  IProjetoTableData,
} from '../../core/interfaces/projeto.interface';
import { IPaginacaoDados } from '../../core/interfaces/paginacao-dados.interface';
import { IHttpGetRequestBody } from '../../core/interfaces/http-get-all-paged.interface';

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

  private readonly _subscription: Subscription = new Subscription();

  private readonly _pageConfig: IHttpGetRequestBody = {
    page: 0,
    size: 15,
    sort: '',
  };

  private projetoFiltroPesquisa: IProjetoFiltroPesquisa = {
    siglaOuTitulo: '',
    idOrganizacao: 0,
    status: 'Status',
  };

  private readonly _projetosList$: BehaviorSubject<Array<IProjetoTableData>> =
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
    // private readonly _usuarioService: UsuarioService,
    private readonly _breadcrumbService: BreadcrumbService,
    private readonly _projetosService: ProjetosService,
    private readonly _navegacaoService: NavegacaoService,
    private readonly _r2: Renderer2
  ) {

    // const isProponente = this._usuarioService.usuarioPerfil.isProponente;

    const botoesAcaoPropriedades = this._projetosService.gerarBotoesAcaoListagem();

    this._breadcrumbService.listaBotaoAcaoPropriedades$.next(
      botoesAcaoPropriedades
    );

    this._subscription.add(
      this._breadcrumbService.executarAcaoBotao$.subscribe((acao) => {
        if (acao === BreadcrumbAcoesEnum.Criar)
          this._navegacaoService.navegacaoSimples(
            BreadcrumbContextoEnum.Projetos,
            BreadcrumbAcoesEnum.Criar
          );
      })
    );

  }

  ngOnInit(): void {
    
    this._subscription.add(
      this._projetosService.atualizarListaProjetos$.subscribe(() => {
        this.fetchPage();
      })
    );

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
          
          console.log('response lista projetos :', response)
          
          this._projetosList$.next(response.content);
          
          this.paginacaoDados = {
            paginaAtual: response.pageable.pageNumber + 1,
            itensPorPagina: response.pageable.pageSize,
            primeiroItemPagina: response.pageable.offset + 1,
            ultimoItemPagina:
              response.pageable.offset + response.numberOfElements,
            totalRegistros: response.totalElements,
          }
          ;
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
    this._subscription.unsubscribe();
    this._breadcrumbService.listaBotaoAcaoPropriedades$.next([]);
  }
}
