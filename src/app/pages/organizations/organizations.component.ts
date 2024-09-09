import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Subscription, tap } from 'rxjs';

import { OrganizacoesService } from '../../shared/services/organizacoes/organizacoes.service';

import { IOrganizationTableData } from '../../shared/interfaces/organization.interface';

import { Config } from 'datatables.net';
import Swal from 'sweetalert2';
import {
  IHttpGetRequestBody,
  IHttpGetResponseBody,
} from '../../shared/interfaces/http/http-get.interface';
import { IOrganizacaoTableData } from '../../shared/interfaces/organizacao.interface';

@Component({
  selector: 'siscap-organizations',
  standalone: false,
  templateUrl: './organizations.component.html',
  styleUrl: './organizations.component.scss',
})
export class OrganizationsComponent implements OnInit, OnDestroy {
  private _subscription: Subscription = new Subscription();

  public datatableConfig: Config = {};

  private pageConfig: IHttpGetRequestBody = {
    page: 0,
    size: 15,
    sort: '',
    search: '',
  };

  imgUserDefault: string = 'assets/images/blank.png';

  constructor(
    private _router: Router,
    private _route: ActivatedRoute,
    private _organizacoesService: OrganizacoesService
  ) {}

  ngOnInit(): void {
    this.treatDatatableConfig();
  }

  private getOrganizacoesPaginated() {
    // return this._organizacoesService.getOrganizacoesPaginated(this.pageConfig);
    return this._organizacoesService.getAllPaged(this.pageConfig);
  }

  private treatDatatableConfig() {
    this.datatableConfig = {
      ajax: (dataTablesParameters: any, callback) => {
        this.pageConfig.page =
          dataTablesParameters.start / dataTablesParameters.length;
        const { order, columns } = dataTablesParameters;
        const orderElement = order[0];
        this.pageConfig.sort = orderElement
          ? `${columns[orderElement.column].data},${orderElement.dir}`
          : '';
        this.getOrganizacoesPaginated().subscribe(
          // (response: IHttpGetResponseBody<IOrganizationTableData>) => {
          (response: IHttpGetResponseBody<IOrganizacaoTableData>) => {
            callback({
              recordsTotal: response.totalElements,
              recordsFiltered: response.totalElements,
              data: response.content,
            });
          }
        );
      },
      searching: true,
      serverSide: true,
      pageLength: this.pageConfig.size,
      lengthMenu: ['5', '10', '20'],
      columns: [
        {
          data: 'imagemPerfil',
          title: '',
          orderable: false,
          render: (data: any) => {
            return `<img class="rounded-circle" src="${this.convertByteArraytoImg(
              data
            )}" alt="Imagem de perfil" width="30" height="30">`;
          },
        },
        { data: 'nomeFantasia', title: 'Sigla' },
        { data: 'nome', title: 'Nome' },
        { data: 'nomeTipoOrganizacao', title: 'Tipo', orderable: false },
        { data: 'telefone', title: 'Telefone' },
        {
          data: 'site',
          title: 'Site',
          render: function (data: string) {
            if (data) {
              let link = data.startsWith(`http`) ? data : '//' + data;
              return `<span class="btn-link" onclick="window.open('${link}', '_blank')">${data}</span>`;
            } else return '';
          },
        },
      ],
      order: [[1, 'asc']],
    };
  }

  public convertByteArraytoImg(data: ArrayBuffer): string {
    if (!data) {
      return this.imgUserDefault;
    }
    return 'data:image/jpeg;base64,' + data;
  }

  public redirectOrganizationForm(OrganizationId: number) {
    this._router.navigate(['form', 'editar'], {
      relativeTo: this._route,
      queryParams: { id: OrganizationId },
    });
  }

  public deletarOrganizacao(id: number) {
    this._organizacoesService
      // .deleteOrganizacao(id)
      .delete(id)
      .pipe(
        tap((response) => {
          if (response) {
            Swal.fire('Organização deletada com sucesso!', '', 'success').then(
              () => {
                this._router
                  .navigateByUrl('/', { skipLocationChange: true })
                  .then(() => this._router.navigateByUrl('main/organizacoes'));
              }
            );
          }
        })
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    this._subscription.unsubscribe();
  }
}
