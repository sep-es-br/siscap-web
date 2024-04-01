import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { Observable, Subscription, first, tap } from 'rxjs';

import { EntidadesService } from '../../shared/services/entidades/entidades.service';
import { ToastService } from '../../shared/services/toast/toast.service';

import {
  IEntityGet,
  IEntityTable,
} from '../../shared/interfaces/entity.interface';
import { ITableActionsDataInput } from '../../shared/interfaces/table-actions-data-input.interface';

@Component({
  selector: 'siscap-entities',
  standalone: false,
  templateUrl: './entities.component.html',
  styleUrl: './entities.component.scss',
})
export class EntitiesComponent implements OnInit, OnDestroy {
  private _getEntidades$: Observable<IEntityGet>;
  private _deleteEntidade$!: Observable<string>;

  private _subscription: Subscription = new Subscription();

  public entidadesList: Array<IEntityTable> = [];

  constructor(
    private _router: Router,
    private _entidadesService: EntidadesService,
    private _toastService: ToastService
  ) {
    this._getEntidades$ = this._entidadesService.getEntidades().pipe(
      first(),
      tap((response: IEntityGet) => {
        this.entidadesList = response.content;
      })
    );
  }

  ngOnInit(): void {
    this._subscription.add(this._getEntidades$.subscribe());
  }

  convertByteArraytoImg(data: ArrayBuffer): string {
    return 'data:image/jpeg;base64,' + data;
  }

  public entidadeDataInput(entity: IEntityTable): ITableActionsDataInput {
    const entidadeDataInput: ITableActionsDataInput = {
      id: entity.id,
      infoTitle:
        'A seguinte organização será excluída. Tem certeza que quer executar a ação?',
      infoBody: {
        Nome: entity.nome,
        Sigla: entity.abreviatura,
      },
    };

    return entidadeDataInput;
  }

  public deleteEntidade(id: number) {
    this._deleteEntidade$ = this._entidadesService.deleteEntidade(id).pipe(
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
    );

    this._subscription.add(this._deleteEntidade$.subscribe());
  }

  queryEntity() {}

  ngOnDestroy(): void {
    this._subscription.unsubscribe();
  }
}
