import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { Observable, Subscription, first, tap } from 'rxjs';

import { PessoasService } from '../../shared/services/pessoas/pessoas.service';
import { ToastService } from '../../shared/services/toast/toast.service';

import {
  IPersonGet,
  IPersonTable,
} from '../../shared/interfaces/person.interface';
import { ITableActionsDataInput } from '../../shared/interfaces/table-actions-data-input.interface';

@Component({
  selector: 'siscap-persons',
  standalone: false,
  templateUrl: './persons.component.html',
  styleUrl: './persons.component.scss',
})
export class PersonsComponent implements OnInit, OnDestroy {
  private _getPessoas$: Observable<IPersonGet>;
  private _deletePessoa$!: Observable<string>;

  private _subscription: Subscription = new Subscription();

  public pessoasList: Array<IPersonTable> = [];

  constructor(
    private _router: Router,
    private _pessoasService: PessoasService,
    private _toastService: ToastService
  ) {
    this._getPessoas$ = this._pessoasService.getPessoas().pipe(
      first(),
      tap((response: IPersonGet) => {
        this.pessoasList = response.content;
      })
    );
  }

  ngOnInit(): void {
    this._subscription.add(this._getPessoas$.subscribe());
  }

  convertByteArraytoImg(data: ArrayBuffer): string {
    return 'data:image/jpeg;base64,' + data;
  }

  public pessoaDataInput(person: IPersonTable): ITableActionsDataInput {
    const pessoaDataInput: ITableActionsDataInput = {
      id: person.id,
      infoTitle:
        'A seguinte pessoa será excluída. Tem certeza que quer executar a ação?',
      infoBody: {
        Nome: person.nome,
        Email: person.email,
      },
    };

    return pessoaDataInput;
  }

  public deletePessoa(id: number) {
    this._deletePessoa$ = this._pessoasService.deletePessoa(id).pipe(
      tap((response) => {
        if (response) {
          this._toastService.showToast(
            'success',
            'Pessoa excluída com sucesso.'
          );
          this._router
            .navigateByUrl('/', { skipLocationChange: true })
            .then(() => this._router.navigateByUrl('main/pessoas'));
        }
      })
    );

    this._subscription.add(this._deletePessoa$.subscribe());
  }

  queryPerson() {}

  ngOnDestroy(): void {
    this._subscription.unsubscribe();
  }
}
