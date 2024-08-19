import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Subscription, tap } from 'rxjs';
import { Config } from 'datatables.net';
import Swal from 'sweetalert2';
import DataTable from 'datatables.net-bs5';

import { ProjetosService } from '../../shared/services/projetos/projetos.service';

import {
  IHttpGetRequestBody,
  IHttpGetResponseBody,
} from '../../shared/interfaces/http-get.interface';
import { IProjetoTableData } from '../../shared/interfaces/projeto.interface';

import { TableTextTruncatePipe } from '../../core/pipes/table-text-truncate/table-text-truncate.pipe';
@Component({
  selector: 'siscap-projects',
  standalone: false,
  templateUrl: './projects.component.html',
  styleUrl: './projects.component.scss',
})
export class ProjectsComponent implements OnInit, OnDestroy {
  private _subscription: Subscription = new Subscription();

  public datatableConfig: Config = {};

  private pageConfig: IHttpGetRequestBody = {
    page: 0,
    size: 15,
    sort: '',
    search: '',
  };
  constructor(
    private _router: Router,
    private _route: ActivatedRoute,
    private _projetosService: ProjetosService
  ) {}

  ngOnInit(): void {
    this.treatDatatableConfig();
  }

  private getProjetosPaginated() {
    return this._projetosService.getProjetosPaginated(this.pageConfig);
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
        this.getProjetosPaginated().subscribe(
          (response: IHttpGetResponseBody<IProjetoTableData>) => {
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
      lengthMenu: ['5', '10', '20'],
      lengthChange: true,
      pageLength: this.pageConfig.size,
      columns: [
        { data: 'sigla', title: 'Sigla' },
        { data: 'titulo', title: 'Título' },
        {
          data: 'nomesCidadesRateio',
          title: 'Cidades Atendidas',
          orderable: false,
          render: (dado: string[]) => TableTextTruncatePipe.prototype.transform(dado, 3),
        },
        {
          data: 'valorEstimado',
          title: 'Valor Estimado',
          render: DataTable.render.number('.', ',', 2, 'R$ '),
          className: 'text-end text-nowrap',
        },
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
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    this._subscription.unsubscribe();
  }
}
