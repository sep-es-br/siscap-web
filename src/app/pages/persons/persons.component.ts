import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { finalize, first, tap } from 'rxjs';

import { PessoasService } from '../../shared/services/pessoas/pessoas.service';
import { ToastNotifierService } from '../../shared/services/toast-notifier/toast-notifier.service';

import {
  IPersonGet,
  IPersonTable,
} from '../../shared/interfaces/person.interface';

@Component({
  selector: 'siscap-persons',
  standalone: false,
  templateUrl: './persons.component.html',
  styleUrl: './persons.component.scss',
})
export class PersonsComponent {
  public pessoasList: Array<IPersonTable> = [];

  constructor(
    private _router: Router,
    private _route: ActivatedRoute,
    private _pessoasService: PessoasService,
    private _toastNotifierService: ToastNotifierService
  ) {
    this._pessoasService
      .getPessoas()
      .pipe(first())
      .subscribe((response: IPersonGet) => {
        this.pessoasList = response.content;
      });
  }

  convertByteArraytoImg(data: ArrayBuffer): string {
    return 'data:image/jpeg;base64,' + data;
  }

  queryPerson() {}

  personDetails(data: any) {
    this._router.navigate(['form', 'detalhes'], {
      relativeTo: this._route,
      queryParams: { id: data.id },
    });
  }

  personEdit(data: any) {
    this._router.navigate(['form', 'editar'], {
      relativeTo: this._route,
      queryParams: { id: data.id },
    });
  }

  personDelete(data: any) {
    if (
      confirm(`
            Tem certeza que deseja deletar o usuário?
            Nome: ${data.nome}
            E-mail: ${data.email}
            `)
    ) {
      this._pessoasService
        .deletePessoa(data.id)
        .pipe(
          tap((response) => {
            if (response) {
              this._toastNotifierService.notifySuccess('Pessoa', 'DELETE');
            }
          }),
          finalize(() => {
            this._toastNotifierService.redirectOnToastClose(
              this._router,
              'main/pessoas',
              true
            );
          })
        )
        .subscribe();
    }
  }

  actionEvent(type: string, data: any) {
    switch (type) {
      case 'detalhes':
        this.personDetails(data);
        break;
      case 'editar':
        this.personEdit(data);
        break;
      case 'deletar':
        this.personDelete(data);
        break;

      default:
        break;
    }
  }
}
