import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Observable, Subscription, tap } from 'rxjs';

import { PessoasService } from '../../shared/services/pessoas/pessoas.service';

import { SortColumn } from '../../core/directives/sortable/sortable.directive';

import {
  IPersonGet,
  IPersonTable,
} from '../../shared/interfaces/person.interface';

import { sortTableColumnsFunction } from '../../shared/utils/sort-table-columns-function';

@Component({
  selector: 'siscap-persons',
  standalone: false,
  templateUrl: './persons.component.html',
  styleUrl: './persons.component.scss',
})
export class PersonsComponent implements OnInit, OnDestroy {
  private _getPessoas$: Observable<IPersonGet>;

  private _subscription: Subscription = new Subscription();

  public pessoasList: Array<IPersonTable> = [];

  constructor(
    private _router: Router,
    private _route: ActivatedRoute,
    private _pessoasService: PessoasService,
  ) {
    this._getPessoas$ = this._pessoasService.getPessoas().pipe(
      tap((response: IPersonGet) => {
        this.pessoasList = response.content;
      })
    );
  }

  ngOnInit(): void {
    this._subscription.add(this._getPessoas$.subscribe());
  }

  public sortTable(event: SortColumn) {
    const column = event.column as keyof IPersonTable;
    const direction = event.direction;

    this.pessoasList.sort((a, b) =>
      sortTableColumnsFunction(a[column], b[column], direction)
    );
  }

  public convertByteArraytoImg(data: ArrayBuffer): string {
    return 'data:image/jpeg;base64,' + data;
  }

  public redirectPersonForm(person: IPersonTable) {
    this._router.navigate(['form', 'editar'], {
      relativeTo: this._route,
      queryParams: { id: person.id },
    });
  }

  queryPerson() {}

  ngOnDestroy(): void {
    this._subscription.unsubscribe();
  }
}
