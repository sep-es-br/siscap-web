import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { first, tap } from 'rxjs';

import { PessoasService } from '../../shared/services/pessoas/pessoas.service';
import { ToastService } from '../../shared/services/toast/toast.service';

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
    private _toastService: ToastService
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
              this._toastService.showToast(
                'success',
                'Pessoa excluída com sucesso.'
              );
              this._router
                .navigateByUrl('/', { skipLocationChange: true })
                .then(() => this._router.navigateByUrl('main/pessoas'));
            }
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
