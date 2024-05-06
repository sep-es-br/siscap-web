import { Component, EventEmitter, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Observable, Subscription, tap } from 'rxjs';

import { PessoasService } from '../../shared/services/pessoas/pessoas.service';

import { SortColumn } from '../../core/directives/sortable/sortable.directive';

import Swal from 'sweetalert2';


import {
  IPersonGet,
  IPersonTable,
} from '../../shared/interfaces/person.interface';

import { sortTableColumnsFunction } from '../../shared/utils/sort-table-columns-function';
import { Config } from 'datatables.net';

@Component({
  selector: 'siscap-persons',
  standalone: false,
  templateUrl: './persons.component.html',
  styleUrl: './persons.component.scss',
})
export class PersonsComponent implements OnInit, OnDestroy {

  private _subscription: Subscription = new Subscription();

  public pessoasList: Array<IPersonTable> = [];

  public datatableConfig: Config = {};

  public dataTableList!: any;

  public page = 0;
  public pageSize = 15;
  public sort = '';
  public search = '';

  reloadEvent: EventEmitter<boolean> = new EventEmitter();
  imgUserDefault: string = 'assets/images/blank.png';


  constructor(
    private _router: Router,
    private _route: ActivatedRoute,
    private _pessoasService: PessoasService
  ) {
  }

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
      queryParams: { id: idPerson },
    });
  }

  getDataPaginated() {
    return this._pessoasService.getPessoaPaginated(this.page, this.pageSize, this.sort, this.search);
  }

  treatDatatableConfig() {
    this.datatableConfig = {

      ajax: (dataTablesParameters: any, callback) => {
        this.page = dataTablesParameters.start / dataTablesParameters.length;
        this.getDataPaginated().subscribe(resp => {
          callback({
            recordsTotal: resp.totalElements,
            recordsFiltered: resp.totalElements,
            data: resp.content
          });
        });
      },
      processing: true,
      serverSide: true,
      searching: true,
      pageLength: this.pageSize,
      columns: [
        { data: 'imagemPerfil', title: '', orderable: false, render: (data: any, type: any, full: any) => { return `<img class="rounded-circle" src="${this.convertByteArraytoImg(data)}" width="50" height="50">` } },
        { data: 'nome', title: 'Nome' },
        { data: 'email', title: 'E-mail' },
        { data: 'nomeOrganizacao', title: 'Organização' }
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
            Swal.fire('Sucesso!', 'Pessoa deletada com sucesso!', 'success').then(() => {
              this._router
                .navigateByUrl('/', { skipLocationChange: true })
                .then(() => this._router.navigateByUrl('main/pessoas'));
            });
          }
        })
      )
      .subscribe();


  }


  queryPerson() { }

  ngOnDestroy(): void {
    this._subscription.unsubscribe();
  }
}
