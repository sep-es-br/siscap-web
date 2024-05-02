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
  private _getOrganizacoes$: Observable<IOrganizationGet>;

  private _subscription: Subscription = new Subscription();

  public organizacoesList: Array<IOrganizationTable> = [];
  
  public datatableConfig: Config = {};

  constructor(
    private _router: Router,
    private _route: ActivatedRoute,
    private _organizacoesService: OrganizacoesService
  ) {
    this._getOrganizacoes$ = this._organizacoesService.getOrganizacoes().pipe(
      tap((response: IOrganizationGet) => {
        this.organizacoesList = response.content;
      })
    );
  }

  ngOnInit(): void {
    this._subscription.add(this._getOrganizacoes$.subscribe());
    this.treatDatatableConfig();
  }

  treatDatatableConfig(){
    // const contentdata = 
    let lastPage=0;  
    let lastSearchText="";
    this.datatableConfig = {

      ajax: (dataTablesParameters: any, callback) => {
        lastPage=dataTablesParameters.start;
        lastSearchText=dataTablesParameters.search.value;
        this._getOrganizacoes$.subscribe(resp => {
          console.log("RESP",resp);
          callback({
            totalPages: resp.totalPages,
            totalItems: resp.totalElements,
            recordsFiltered: resp.pageable,
            data: resp.content
          });
        });
      },
      searching: true,
      lengthMenu:['5','10','20'],
      columns: [
        { data: 'id', title: 'ID' },
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
