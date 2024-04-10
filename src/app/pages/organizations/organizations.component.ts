import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Observable, Subscription, tap } from 'rxjs';

import { OrganizacoesService } from '../../shared/services/organizacoes/organizacoes.service';
import { ToastService } from '../../shared/services/toast/toast.service';

import { SortColumn } from '../../core/directives/sortable/sortable.directive';

import {
  IOrganizationGet,
  IOrganizationTable,
} from '../../shared/interfaces/organization.interface';
import { ITableActionsDataInput } from '../../shared/interfaces/table-actions-data-input.interface';

import { sortTableColumnsFunction } from '../../shared/utils/sort-table-columns-function';

@Component({
  selector: 'siscap-organizations',
  standalone: false,
  templateUrl: './organizations.component.html',
  styleUrl: './organizations.component.scss',
})
export class OrganizationsComponent implements OnInit, OnDestroy {
  private _getOrganizacoes$: Observable<IOrganizationGet>;
  private _deleteOrganizacao$!: Observable<string>;

  private _subscription: Subscription = new Subscription();

  public organizacoesList: Array<IOrganizationTable> = [];

  constructor(
    private _router: Router,
    private _route: ActivatedRoute,
    private _organizacoesService: OrganizacoesService,
    private _toastService: ToastService
  ) {
    this._getOrganizacoes$ = this._organizacoesService.getOrganizacoes().pipe(
      tap((response: IOrganizationGet) => {
        this.organizacoesList = response.content;
      })
    );
  }

  ngOnInit(): void {
    this._subscription.add(this._getOrganizacoes$.subscribe());
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

  public redirectOrganizationForm(org: IOrganizationTable) {
    this._router.navigate(['form', 'editar'], {
      relativeTo: this._route,
      queryParams: { id: org.id },
    });
  }

  // public organizacaoDataInput(
  //   organization: IOrganizationTable
  // ): ITableActionsDataInput {
  //   const organizacaoDataInput: ITableActionsDataInput = {
  //     id: organization.id,
  //     infoTitle:
  //       'A seguinte organização será excluída. Tem certeza que quer executar a ação?',
  //     infoBody: {
  //       Nome: organization.nome,
  //       Sigla: organization.abreviatura,
  //     },
  //   };

  //   return organizacaoDataInput;
  // }

  // public deleteOrganizacao(id: number) {
  //   this._deleteOrganizacao$ = this._organizacoesService
  //     .deleteOrganizacao(id)
  //     .pipe(
  //       tap((response) => {
  //         if (response) {
  //           this._toastService.showToast(
  //             'success',
  //             'Organização excluída com sucesso.'
  //           );
  //           this._router
  //             .navigateByUrl('/', { skipLocationChange: true })
  //             .then(() => this._router.navigateByUrl('main/organizacoes'));
  //         }
  //       })
  //     );

  //   this._subscription.add(this._deleteOrganizacao$.subscribe());
  // }

  queryOrganization() {}

  ngOnDestroy(): void {
    this._subscription.unsubscribe();
  }
}
