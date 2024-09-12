import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Observable, Subscription, tap } from 'rxjs';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';

import { ProgramasService } from '../../shared/services/programas/programas.service';

import {
  IHttpGetRequestBody,
  IHttpGetResponseBody,
} from '../../shared/interfaces/http/http-get.interface';
import { IProgramaTableData } from '../../shared/interfaces/programa.interface';

@Component({
  selector: 'siscap-programas',
  standalone: false,
  templateUrl: './programas.component.html',
  styleUrl: './programas.component.scss',
})
export class ProgramasComponent implements OnInit {
  @ViewChild('deleteSwal')
  public readonly deleteSwal!: SwalComponent;

  @ViewChild('successSwal')
  public readonly successSwal!: SwalComponent;

  private _getProgramasPaged$!: Observable<
    IHttpGetResponseBody<IProgramaTableData>
  >;

  private _subscription: Subscription = new Subscription();

  public programasList: Array<IProgramaTableData> = [];

  public pageConfig: IHttpGetRequestBody = {
    size: 15,
    page: 0,
    sort: '',
    search: '',
  };

  public primeiroItemPagina: number = 0;
  public ultimoItemPagina: number = 0;
  public totalRegistros: number = 0;

  public deleteSwalOptions = {
    buttonsStyling: false,
    confirmButtonText: 'Sim, excluir',
    cancelButtonText: 'Não, manter',
  };

  public successSwalOptions = {
    buttonsStyling: false,
    confirmButtonText: 'Ok',
  };

  public deleteSwalText =
    'Você está deletando o seguinte registro:' +
    '<br/ ><br />' +
    `<b>tituloPrograma</b>` +
    '<br/ ><br />' +
    'Esta ação não poderá ser desfeita. Deseja continuar?';

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _programasService: ProgramasService
  ) {
    this._getProgramasPaged$ = this._programasService
      .getProgramasPaged(this.pageConfig)
      .pipe(
        tap((response: IHttpGetResponseBody<IProgramaTableData>) => {
          this.programasList = response.content;
          this.primeiroItemPagina = response.pageable.offset + 1;
          this.ultimoItemPagina =
            response.pageable.offset + response.numberOfElements;
          this.totalRegistros = response.totalElements;
        })
      );
  }

  ngOnInit(): void {
    this._subscription.add(this._getProgramasPaged$.subscribe());
  }

  public editarPrograma(idPrograma: number): void {
    this._router.navigate(['form', 'editar'], {
      relativeTo: this._route,
      queryParams: { id: idPrograma },
    });
  }

  public dispararModalExcluirPrograma(programa: IProgramaTableData): void {
    this.deleteSwalText = this.deleteSwalText.replace(
      'tituloPrograma',
      programa.titulo
    );

    setTimeout(() => {
      this.deleteSwal.fire().then((result) => {
        if (result.isConfirmed && result.value) {
          this.excluirPrograma(programa.id);
        }
      });
    }, 1);
  }

  private excluirPrograma(idPrograma: number): void {
    this._programasService
      .deletePrograma(idPrograma)
      .pipe(
        tap((response) => {
          if (response) {
            this.successSwal.fire();
            this._router
              .navigateByUrl('/', { skipLocationChange: true })
              .then(() => this._router.navigateByUrl('main/programas'));
          }
        })
      )
      .subscribe();
  }
}
