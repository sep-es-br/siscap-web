import { Component, OnInit } from '@angular/core';
import { PessoasService } from '../../shared/services/pessoas/pessoas.service';
import { first } from 'rxjs';
import { IPersonTable } from '../../shared/interfaces/person.interface';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-persons',
  standalone: false,
  templateUrl: './persons.component.html',
  styleUrl: './persons.component.scss',
})
export class PersonsComponent {
  public pessoasList: Array<IPersonTable> = [];

  constructor(
    private _router: Router,
    private _route: ActivatedRoute,
    private _pessoasService: PessoasService
  ) {
    this._pessoasService
      .getPessoas()
      .pipe(first())
      .subscribe((response) => {
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
      this._pessoasService.deletePessoa(data.id).subscribe(
        (response) => {
          console.log(response);
          if (response) {
            alert('Usuário excluido com sucesso.');
          }
        },
        (err) => {},
        () => {
          this._router
            .navigateByUrl('/', { skipLocationChange: true })
            .then(() => this._router.navigate(['main', 'pessoas']));
        }
      );
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
