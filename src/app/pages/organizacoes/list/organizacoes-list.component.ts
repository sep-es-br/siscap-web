import { Component, input, output } from '@angular/core';
import { Router } from '@angular/router';

import { tap } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { DeleteModalComponent } from '../../../shared/templates/delete-modal/delete-modal.component';
import { SuccessModalComponent } from '../../../shared/templates/success-modal/success-modal.component';

import { SortColumn } from '../../../shared/directives/sortable/sortable.directive';

import { OrganizacoesService } from '../../../core/services/organizacoes/organizacoes.service';

import { IOrganizacaoTableData } from '../../../core/interfaces/organizacao.interface';

import { converterArrayBufferEmImgSrc } from '../../../core/utils/functions';

@Component({
  selector: 'siscap-organizacoes-list',
  standalone: false,
  templateUrl: './organizacoes-list.component.html',
  styleUrl: './organizacoes-list.component.scss',
})
export class OrganizacoesListComponent {
  public organizacoesList = input<Array<IOrganizacaoTableData> | null>([]);
  public sortableDirectiveOutput = output<string>();

  public converterArrayBufferEmImgSrc: (
    imgArrayBuffer: ArrayBuffer | null
  ) => string = converterArrayBufferEmImgSrc;

  constructor(
    private _router: Router,
    private _organizacoesService: OrganizacoesService,
    private _ngbModalService: NgbModal
  ) {}

  public sortColumn(event: SortColumn): void {
    this.sortableDirectiveOutput.emit(`${event.column},${event.direction}`);
  }

  public tableActionOutputEvent(event: { acao: string; id: number }): void {
    switch (event.acao) {
      case 'editar':
        this.editarOrganizacao(event.id);
        break;

      case 'deletar':
        this.deletarOrganizacao(event.id);
        break;

      default:
        break;
    }
  }

  public editarOrganizacao(id: number): void {
    this._organizacoesService.idOrganizacao$.next(id);

    this._router.navigate(['main', 'organizacoes', 'editar']);
  }

  private deletarOrganizacao(id: number): void {
    const organizacaoTableData = this.organizacoesList()?.find(
      (organizacao) => organizacao.id === id
    );

    this.dispararModalDeletar(organizacaoTableData!);
  }

  private dispararModalDeletar(
    organizacaoTableData: IOrganizacaoTableData
  ): void {
    const modalRef = this._ngbModalService.open(DeleteModalComponent, {
      centered: true,
    });

    modalRef.componentInstance.conteudo = `${organizacaoTableData.nomeFantasia} - ${organizacaoTableData.nome}`;

    modalRef.result.then(
      (resolve) => {
        this._organizacoesService
          .delete(organizacaoTableData.id)
          .pipe(tap((response) => this.dispararModalSucesso(response)))
          .subscribe();
      },
      (reject) => {}
    );
  }

  private dispararModalSucesso(response: string): void {
    const modalRef = this._ngbModalService.open(SuccessModalComponent, {
      centered: true,
    });

    modalRef.componentInstance.conteudo = response;

    modalRef.result.then(
      (resolve) => {},
      (reject) => {
        this._router
          .navigateByUrl('/', { skipLocationChange: true })
          .then(() => this._router.navigateByUrl('main/organizacoes'));
      }
    );
  }
}
