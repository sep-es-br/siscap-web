import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Observable, Subscription, first, tap } from 'rxjs';

import { ProjetosService } from '../../shared/services/projetos/projetos.service';

import { SortColumn } from '../../core/directives/sortable/sortable.directive';

import {
  IProjectGet,
  IProjectTable,
} from '../../shared/interfaces/project.interface';

import { sortTableColumnsFunction } from '../../shared/utils/sort-table-columns-function';

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
  }

  public sortTable(event: SortColumn) {
    const column = event.column as keyof IProjectTable;
    const direction = event.direction;

    this.projetosList.sort((a, b) =>
      sortTableColumnsFunction(a[column], b[column], direction)
    );
  }

  public redirectProjectForm(project: IProjectTable) {
    this._router.navigate(['form', 'editar'], {
      relativeTo: this._route,
      queryParams: { id: project.id },
    });
  }

  queryProject() {}

  ngOnDestroy(): void {
    this._subscription.unsubscribe();
  }
}
