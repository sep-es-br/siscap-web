import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { first, tap } from 'rxjs';

import { EntidadesService } from '../../shared/services/entidades/entidades.service';
import { ToastService } from '../../shared/services/toast/toast.service';

import {
  IEntityGet,
  IEntityTable,
} from '../../shared/interfaces/entity.interface';

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
    private _entidadesService: EntidadesService,
    private _toastService: ToastService
  ) {
    this._entidadesService
      .getEntidades()
      .pipe(first())
      .subscribe((response: IEntityGet) => {
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
      this._entidadesService
        .deleteEntidade(data.id)
        .pipe(
          tap((response) => {
            if (response) {
              this._toastService.showToast(
                'success',
                'Organização excluída com sucesso.'
              );
              this._router
                .navigateByUrl('/', { skipLocationChange: true })
                .then(() => this._router.navigateByUrl('main/entidades'));
            }
          })
        )
        .subscribe();
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
