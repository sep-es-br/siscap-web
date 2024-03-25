import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { first } from 'rxjs';

import { EntidadesService } from '../../shared/services/entidades/entidades.service';
import { IEntityTable } from '../../shared/interfaces/entity.interface';

@Component({
  selector: 'siscap-entities',
  standalone: false,
  templateUrl: './entities.component.html',
  styleUrl: './entities.component.scss',
})
export class EntitiesComponent {
  public entidadesList: Array<IEntityTable> = [];

  constructor(
    private _router: Router,
    private _route: ActivatedRoute,
    private _entidadesService: EntidadesService
  ) {
    this._entidadesService
      .getEntidades()
      .pipe(first())
      .subscribe((response) => {
        this.entidadesList = response.content;
      });
  }

  convertByteArraytoImg(data: ArrayBuffer): string {
    return 'data:image/jpeg;base64,' + data;
  }

  queryEntity() {}

  entityDetails(data: any) {
    this._router.navigate(['form', 'detalhes'], {
      relativeTo: this._route,
      queryParams: { id: data.id },
    });
  }

  entityEdit(data: any) {
    this._router.navigate(['form', 'editar'], {
      relativeTo: this._route,
      queryParams: { id: data.id },
    });
  }

  entityDelete(data: any) {
    if (
      confirm(`
            Tem certeza que deseja deletar a entidade?
            Nome: ${data.nome}
            Sigla: ${data.abreviatura}
            `)
    ) {
      this._entidadesService.deleteEntidade(data.id).subscribe(
        (response) => {
          console.log(response);
          if (response) {
            alert('Entidade excluída com sucesso.');
          }
        },
        (err) => {},
        () => {
          this._router
            .navigateByUrl('/', { skipLocationChange: true })
            .then(() => this._router.navigate(['main', 'entidades']));
        }
      );
    }
  }

  actionEvent(type: string, data: any) {
    switch (type) {
      case 'detalhes':
        this.entityDetails(data);
        break;
      case 'editar':
        this.entityEdit(data);
        break;
      case 'deletar':
        this.entityDelete(data);
        break;
      default:
        break;
    }
  }
}
