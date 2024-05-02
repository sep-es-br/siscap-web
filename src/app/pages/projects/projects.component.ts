import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Observable, Subscription, first, tap } from 'rxjs';

import { ProjetosService } from '../../shared/services/projetos/projetos.service';

import { SortColumn } from '../../core/directives/sortable/sortable.directive';

import { IProjectGet, IProjectTable } from '../../shared/interfaces/project.interface';

import { sortTableColumnsFunction } from '../../shared/utils/sort-table-columns-function';
import { Config } from 'datatables.net';
import Swal from 'sweetalert2';

@Component({
  selector: 'siscap-projects',
  standalone: false,
  templateUrl: './projects.component.html',
  styleUrl: './projects.component.scss',
})
export class ProjectsComponent implements OnInit, OnDestroy {
  private _getProjetos$: Observable<IProjectGet>;

  private _subscription: Subscription = new Subscription();

  public projetosList: Array<IProjectTable> = [];

  public datatableConfig: Config = {};

  constructor(
    private _router: Router,
    private _route: ActivatedRoute,
    private _projetosService: ProjetosService,
  ) {
    this._getProjetos$ = this._projetosService.getProjetos().pipe(
      first(),
      tap((response: IProjectGet) => {
        this.projetosList = response.content;
      })
    );
  }

  ngOnInit(): void {
    this._subscription.add(this._getProjetos$.subscribe());
    this.treatDatatableConfig();
  }

  public sortTable(event: SortColumn) {
    const column = event.column as keyof IProjectTable;
    const direction = event.direction;

    this.projetosList.sort((a, b) =>
      sortTableColumnsFunction(a[column], b[column], direction)
    );
  }

  treatDatatableConfig(){
    // const contentdata = 
    let lastPage=0;  
    let lastSearchText="";
    this.datatableConfig = {

      ajax: (dataTablesParameters: any, callback) => {
        lastPage=dataTablesParameters.start;
        lastSearchText=dataTablesParameters.search.value;
        this._getProjetos$.subscribe(resp => {
          callback({
            totalPages: resp.totalPages,
            totalItems: resp.totalElements,
            recordsFiltered: resp.pageable,
            data: resp.content
          });
        });
      },
      searching: true,
      serverSide: true,
      lengthMenu:['5','10','20'],
      columns: [
        { data: 'sigla', title: 'Sigla' },
        { data: 'titulo', title: 'Título' },
        { data: 'nomesMicrorregioes', title: 'Microrregiões' },
        { data: 'valorEstimado', title: 'Valor Estimado' },
      ],
      order: [[1, 'asc']],
    };

  }

  public redirectProjectForm(projectId: number) {
    this._router.navigate(['form', 'editar'], {
      relativeTo: this._route,
      queryParams: { id: projectId },
    });
  }

  public deletarProjeto(id: number) {

        this._projetosService
          .deleteProjeto(id)
          .pipe(
            tap((response) => {
              if (response) {
                Swal.fire('Projeto deletado com sucesso!', '', 'success');
                this._router
                  .navigateByUrl('/', { skipLocationChange: true })
                  .then(() => this._router.navigateByUrl('main/projetos'));
              }
            })
          );
          
  }

  queryProject() {}

  ngOnDestroy(): void {
    this._subscription.unsubscribe();
  }
}
