import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Observable, Subscription, tap } from 'rxjs';

import { OrganizacoesService } from '../../shared/services/organizacoes/organizacoes.service';

import { SortColumn } from '../../core/directives/sortable/sortable.directive';

import {
  IOrganizationGet,
  IOrganizationTable,
} from '../../shared/interfaces/organization.interface';

import { sortTableColumnsFunction } from '../../shared/utils/sort-table-columns-function';
import { Config } from 'datatables.net';
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
  public pageSize = 10;
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

  getData(){
   return this._organizacoesService.getOrganizacaoPaginated(this.page, this.pageSize, this.sort, this.search);
  }

  treatDatatableConfig(){
    // const contentdata = 
    let lastPage=0;  
    let lastSearchText="";
    this.datatableConfig = {

      ajax: (dataTablesParameters: any, callback) => {
        lastPage=dataTablesParameters.start;
        lastSearchText=dataTablesParameters.search.value;
        this.getData().subscribe(resp => {
          console.log("RESP",resp);
          callback({
            recordsTotal: resp.totalElements,
            recordsFiltered: resp.totalElements,
            data:  resp.content
          });
        });
      },
      searching: true,
      lengthMenu:['5','10','20'],
      columns: [
        { data: 'imagemPerfil', title: '', orderable :false, render: (data: any, type: any, full: any) => { return `<img class="rounded-circle" src="${this.convertByteArraytoImg(data)}" width="50" height="50">` } },
        { data: 'abreviatura', title: 'Sigla' },
        { data: 'nome', title: 'Nome' },
        { data: 'nomeTipoOrganizacao', title: 'Tipo' },
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
    if(!data){
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

    console.log("ID",id);
    
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

  queryOrganization() {}

  ngOnDestroy(): void {
    this._subscription.unsubscribe();
  }
}
