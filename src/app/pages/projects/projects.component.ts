import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';

import {Subscription, tap} from 'rxjs';

import {ProjetosService} from '../../shared/services/projetos/projetos.service';

import {IProjectTable} from '../../shared/interfaces/project.interface';
import {Config} from 'datatables.net';
import Swal from 'sweetalert2';
import DataTable from 'datatables.net-bs5';

@Component({
  selector: 'siscap-projects',
  standalone: false,
  templateUrl: './projects.component.html',
  styleUrl: './projects.component.scss',
})
export class ProjectsComponent implements OnInit, OnDestroy {

  private _subscription: Subscription = new Subscription();

  public projetosList: Array<IProjectTable> = [];

  public datatableConfig: Config = {};

  public page = 0;
  public pageSize = 15;
  public sort = '';
  public search = '';

  constructor(
    private _router: Router,
    private _route: ActivatedRoute,
    private _projetosService: ProjetosService,
  ) {
  }

  ngOnInit(): void {
    this.treatDatatableConfig();
  }

  getDataPaginated() {
    return this._projetosService.getProjetosPaginated(this.page, this.pageSize, this.sort, this.search);
  }

  treatDatatableConfig() {
    this.datatableConfig = {

      ajax: (dataTablesParameters: any, callback) => {
        this.page = dataTablesParameters.start / dataTablesParameters.length;
        const { order, columns } = dataTablesParameters;
        const orderElement = order[0];
        this.sort = orderElement ? `${columns[orderElement.column].data},${orderElement.dir}` : '';
        this.getDataPaginated().subscribe(resp => {
          callback({
            recordsTotal: resp.totalElements,
            recordsFiltered: resp.totalElements,
            data: resp.content
          });
        });
      },
      searching: true,
      serverSide: true,
      lengthMenu: ['5', '10', '20'],
      lengthChange: true,
      pageLength: this.pageSize,
      columns: [
        { data: 'sigla', title: 'Sigla' },
        { data: 'titulo', title: 'Título' },
        { data: 'nomesMicrorregioes', title: 'Microrregiões', orderable: false, render: (dado: string[]) => Array.isArray(dado) ? dado.join(", ") : dado },
        { data: 'valorEstimado', title: 'Valor Estimado', render: DataTable.render.number('.', ',', 2, 'R$ '), className: 'text-end text-nowrap' },
      ],
    };

  }

  public redirectProjectForm(projectId: number) {
    this._router.navigate(['form', 'editar'], {
      relativeTo: this._route,
      queryParams: { id: projectId, isEdit: true },
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
      ).subscribe();
  }

  ngOnDestroy(): void {
    this._subscription.unsubscribe();
  }
}
