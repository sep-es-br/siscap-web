import { Component, EventEmitter, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Subscription, tap } from 'rxjs';

import { PessoasService } from '../../shared/services/pessoas/pessoas.service';

import Swal from 'sweetalert2';

import { Config } from 'datatables.net';
import {
  IHttpGetRequestBody,
  IHttpGetResponseBody,
} from '../../shared/interfaces/http-get.interface';
import { IPersonTableData } from '../../shared/interfaces/person.interface';

@Component({
  selector: 'siscap-persons',
  standalone: false,
  templateUrl: './persons.component.html',
  styleUrl: './persons.component.scss',
})
export class PersonsComponent implements OnInit, OnDestroy {
  private _subscription: Subscription = new Subscription();

  public datatableConfig: Config = {};

  private pageConfig: IHttpGetRequestBody = {
    page: 0,
    size: 15,
    sort: '',
    search: '',
  };

  reloadEvent: EventEmitter<boolean> = new EventEmitter();
  imgUserDefault: string = 'assets/images/blank.png';

  constructor(
    private _router: Router,
    private _route: ActivatedRoute,
    private _pessoasService: PessoasService
  ) {}

  ngOnInit(): void {
    this.treatDatatableConfig();
  }

  public convertByteArraytoImg(data: ArrayBuffer): string {
    if (!data) {
      return this.imgUserDefault;
    }
    return 'data:image/jpeg;base64,' + data;
  }

  public redirectPersonForm(idPerson: number) {
    this._router.navigate(['form', 'editar'], {
      relativeTo: this._route,
      queryParams: { id: idPerson, isEdit: true },
    });
  }

  private getPessoasPaginated() {
    return this._pessoasService.getPessoasPaginated(this.pageConfig);
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
        this.getPessoasPaginated().subscribe(
          (response: IHttpGetResponseBody<IPersonTableData>) => {
            callback({
              recordsTotal: response.totalElements,
              recordsFiltered: response.totalElements,
              data: response.content,
            });
          }
        );
      },
      processing: true,
      serverSide: true,
      searching: true,
      pageLength: this.pageConfig.size,
      columns: [
        {
          data: 'imagemPerfil',
          title: '',
          orderable: false,
          render: (data: any) => {
            return `<img class="rounded-circle img-profile" src="${this.convertByteArraytoImg(
              data
            )}" alt="Imagem da organização" width="30" height="30">`;
          },
        },
        { data: 'nome', title: 'Nome' },
        { data: 'email', title: 'E-mail' },
        { data: 'nomeOrganizacao', title: 'Organização', orderable: false },
      ],
      order: [[1, 'asc']],
    };
  }

  public deletarPessoa(id: number) {
    this._pessoasService
      .deletePessoa(id)
      .pipe(
        tap((response) => {
          if (response) {
            Swal.fire(
              'Sucesso!',
              'Pessoa deletada com sucesso!',
              'success'
            ).then(() => {
              this._router
                .navigateByUrl('/', { skipLocationChange: true })
                .then(() => this._router.navigateByUrl('main/pessoas'));
            });
          }
        })
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    this._subscription.unsubscribe();
  }
}
