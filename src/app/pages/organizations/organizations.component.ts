import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';

import {Subscription, tap} from 'rxjs';

import {OrganizacoesService} from '../../shared/services/organizacoes/organizacoes.service';

import {SortColumn} from '../../core/directives/sortable/sortable.directive';

import {IOrganizationTable,} from '../../shared/interfaces/organization.interface';

import {sortTableColumnsFunction} from '../../shared/utils/sort-table-columns-function';
import {Config} from 'datatables.net';
import Swal from 'sweetalert2';

@Component({
  selector: 'siscap-organizations',
  standalone: false,
  templateUrl: './organizations.component.html',
  styleUrl: './organizations.component.scss',
})
export class OrganizationsComponent implements OnInit, OnDestroy {
  private _subscription: Subscription = new Subscription();

  public organizacoesList: Array<IOrganizationTable> = [];

  public datatableConfig: Config = {};
  public page = 0;
  public pageSize = 15;
  public sort = '';
  public search = '';
  imgUserDefault: string = 'assets/images/blank.png';

  constructor(
    private _router: Router,
    private _route: ActivatedRoute,
    private _organizacoesService: OrganizacoesService
  ) {
  }

  ngOnInit(): void {
    this.treatDatatableConfig();
  }

  getData() {
    return this._organizacoesService.getOrganizacaoPaginated(this.page, this.pageSize, this.sort, this.search);
  }

  treatDatatableConfig() {
    this.datatableConfig = {

      ajax: (dataTablesParameters: any, callback) => {
        this.page = dataTablesParameters.start / dataTablesParameters.length;
        this.getData().subscribe(resp => {
          callback({
            recordsTotal: resp.totalElements,
            recordsFiltered: resp.totalElements,
            data: resp.content
          });
        });
      },
      searching: true,
      serverSide: true,
      pageLength:this.pageSize,
      lengthMenu: ['5', '10', '20'],
      columns: [
        { data: 'imagemPerfil', title: '', orderable: false, render: (data: any, type: any, full: any) => { return `<img class="rounded-circle" src="${this.convertByteArraytoImg(data)}" width="30" height="30">` } },
        { data: 'abreviatura', title: 'Sigla' },
        { data: 'nome', title: 'Nome' },
        { data: 'nomeTipoOrganizacao', title: 'Tipo' },
        { data: 'telefone', title: 'Telefone' },
        {
          data: 'site', title: 'Site', render: function (data: string) {
            if (data) {
              let link = data.startsWith(`http`) ? data : '//' + data;
              return `<p class="btn-link" onclick="window.open('${link}', '_blank')">${data}</p>`;
            }
            else
              return '';
          }
        },
      ],
      order: [[1, 'asc']],
    };

  }


  public sortTable(event: SortColumn) {
    const column = event.column as keyof IOrganizationTable;
    const direction = event.direction;

    this.organizacoesList.sort((a, b) =>
      sortTableColumnsFunction(a[column], b[column], direction)
    );
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
      queryParams: { id: OrganizationId , isEdit: true },
    });
  }

  public deletarOrganizacao(id: number) {
    this._organizacoesService
      .deleteOrganizacao(id)
      .pipe(
        tap((response) => {
          if (response) {
            Swal.fire('Organização deletada com sucesso!', '', 'success').then(() => {
              this._router
                .navigateByUrl('/', { skipLocationChange: true })
                .then(() => this._router.navigateByUrl('main/organizacoes'));
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
