import { Component, OnInit, Renderer2 } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OrganizacoesService } from '../../../shared/services/organizacoes/organizacoes.service';
import {
  IHttpGetRequestBody,
  IHttpGetResponseBody,
} from '../../../shared/interfaces/http/http-get.interface';
import { BehaviorSubject, distinct, finalize, Observable, of, tap } from 'rxjs';
import { IOrganizacaoTableData } from '../../../shared/interfaces/organizacao.interface';
import { SortColumn } from '../../../core/directives/sortable/sortable.directive';
import { IPagination } from '../../../shared/interfaces/pagination.interface';
import { converterArrayBufferEmImgSrc } from '../../../shared/utils/convert-array-buffer-image-source';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { BaseModalComponent } from '../../../core/templates/base-modal/base-modal.component';

@Component({
  selector: 'siscap-organizacoes-list',
  standalone: false,
  templateUrl: './organizacoes-list.component.html',
  styleUrl: './organizacoes-list.component.scss',
})
export class OrganizacoesListComponent implements OnInit {
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

  public paginacaoData: IPagination = {
    paginaAtual: 1,
    itensPorPagina: 15,
    primeiroItemPagina: 0,
    ultimoItemPagina: 0,
    totalRegistros: 0,
  };

  public converterArrayBufferEmImgSrc = converterArrayBufferEmImgSrc;

  constructor(
    private _router: Router,
    private _route: ActivatedRoute,
    private _organizacoesService: OrganizacoesService,
    private _r2: Renderer2,
    private _ngbModalService: NgbModal
  ) {}

  ngOnInit(): void {
    this.fetchPage();
  }

  public paginacaoOutputEvent(event: number): void {
    this.fetchPage({ page: event - 1 });
  }

  public sortableDirectiveEvent(event: SortColumn): void {
    this.fetchPage({ sort: `${event.column},${event.direction}` });
  }

  public tableActionOutputEvent(event: { acao: string; id: number }): void {
    switch (event.acao) {
      case 'editar':
        this.editarOrganizacao(event.id);
        break;

      case 'deletar':
        // logica de deletar
        // disparar modal de confirmação
        this.deletarOrganizacao(event.id);
        break;

      default:
        break;
    }
  }

  public editarOrganizacao(id: number): void {
    // console.log('dentro de OrganizacoesList -> editarOrganizacao');
    // console.log(id);

    this._router.navigate(['form', 'editar'], {
      relativeTo: this._route,
      queryParams: { id: id },
    });
  }

  private deletarOrganizacao(id: number): void {
    // console.log('dentro de OrganizacoesList -> deletarOrganizacao');
    // console.log(id);

    const organizacao = this._organizacoesList$.value.find(
      (org) => org.id === id
    );

    this.dispararModalConfirmacao(organizacao!);
  }

  private dispararModalConfirmacao(
    organizacaoTableData: IOrganizacaoTableData
  ): void {
    const modalRef = this._ngbModalService.open(BaseModalComponent, {
      centered: true,
    });

    modalRef.componentInstance.titulo = {
      texto: 'Atenção!',
      background: 'danger-subtle',
    };

    modalRef.componentInstance.corpo = {
      texto: `
        Você está prestes a deletar a seguinte organização:
        <br /><br />
        <b> ${organizacaoTableData.nomeFantasia} - ${organizacaoTableData.nome} </b>
        <br /><br />
        Esta ação não poderá ser desfeita. Deseja continuar?
      `,
    };

    modalRef.componentInstance.rodape = [
      { texto: 'Voltar', background: 'outline-primary', resultado: false },
      { texto: 'Prosseguir', background: 'danger', resultado: true },
    ];

    modalRef.result.then(
      (resolve) => {
        console.log('resolve da Promise modalRef.result');
        console.log(resolve);

        if (resolve) {
          // console.log('VAI DELETAR MESMO HEIN')

          this._organizacoesService
            .delete(organizacaoTableData.id)
            .pipe(
              tap((response) => {
                console.log(response)

                // OBS: VER auth.interceptor.ts (CASO TRATAMENTO DE ERROS)

                // if (response) {
                //   this.dispararModalSucesso(response);
                // }
              })
            )
            .subscribe();
        }
      },
      (reject) => {
        console.log('reject da Promise modalRef.result');
        console.log(reject);
      }
    );
  }

  private dispararModalSucesso(response: string): void {
    const modalRef = this._ngbModalService.open(BaseModalComponent, {
      centered: true,
    });

    modalRef.componentInstance.titulo = {
      texto: 'Sucesso!',
      background: 'success-subtle',
    };

    modalRef.componentInstance.corpo = {
      // texto: `
      //   Você está prestes a deletar a seguinte organização:
      //   <br /><br />
      //   <b> ${organizacaoTableData.nomeFantasia} - ${organizacaoTableData.nome} </b>
      //   <br /><br />
      //   Esta ação não poderá ser desfeita. Deseja continuar?
      // `,
      texto: response,
    };

    modalRef.componentInstance.rodape = [
      { texto: 'OK', background: 'outline-success', resultado: true },
    ];

    modalRef.result.then(
      (resolve) => {
        this._router
          .navigateByUrl('/', { skipLocationChange: true })
          .then(() => this._router.navigateByUrl('main/organizacoes'));
      },
      (reject) => {
        this._router
          .navigateByUrl('/', { skipLocationChange: true })
          .then(() => this._router.navigateByUrl('main/organizacoes'));
      }
    );
  }

  private fetchPage(pageConfigParam?: {
    [K in keyof IHttpGetRequestBody]?: IHttpGetRequestBody[K];
  }): void {
    if (pageConfigParam && !pageConfigParam['sort']) {
      this.limparSortColumn();
    }

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
