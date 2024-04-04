import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { Observable, Subscription, first, tap } from 'rxjs';

import { ProjetosService } from '../../shared/services/projetos/projetos.service';
import { ToastService } from '../../shared/services/toast/toast.service';

import {
  IProjectGet,
  IProjectTable,
} from '../../shared/interfaces/project.interface';
import { ITableActionsDataInput } from '../../shared/interfaces/table-actions-data-input.interface';

@Component({
  selector: 'siscap-projects',
  standalone: false,
  templateUrl: './projects.component.html',
  styleUrl: './projects.component.scss',
})
export class ProjectsComponent implements OnInit, OnDestroy {
  private _getProjetos$: Observable<IProjectGet>;
  private _deleteProjeto$!: Observable<string>;

  private _subscription: Subscription = new Subscription();

  public projetosList: Array<IProjectTable> = [];

  constructor(
    private _router: Router,
    private _projetosService: ProjetosService,
    private _toastService: ToastService
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
  }

  public sortBy(column: keyof IProjectTable) {
    console.log(column)
    this.projetosList.sort( (a, b) => a[column] < b[column] ? -1 : a[column] > b[column] ? 1 : 0)
  }

  public projetoDataInput(project: IProjectTable): ITableActionsDataInput {
    const projetoDataInput: ITableActionsDataInput = {
      id: project.id,
      infoTitle:
        'O seguinte projeto será excluído. Tem certeza que quer executar a ação?',
      infoBody: {
        Sigla: project.sigla,
        'Nome do Projeto': project.titulo,
      },
    };

    return projetoDataInput;
  }

  public deleteProjeto(id: number) {
    this._deleteProjeto$ = this._projetosService.deleteProjeto(id).pipe(
      tap((response) => {
        if (response) {
          this._toastService.showToast(
            'success',
            'Projeto excluído com sucesso.'
          );
          this._router
            .navigateByUrl('/', { skipLocationChange: true })
            .then(() => this._router.navigateByUrl('main/projetos'));
        }
      })
    );

    this._subscription.add(this._deleteProjeto$.subscribe());
  }

  queryProject() {}

  ngOnDestroy(): void {
    this._subscription.unsubscribe();
  }
}
