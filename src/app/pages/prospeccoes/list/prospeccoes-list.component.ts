import { Component, input, output } from '@angular/core';
import { Router } from '@angular/router';

import { tap } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { DeleteModalComponent } from '../../../shared/templates/delete-modal/delete-modal.component';
import { SuccessModalComponent } from '../../../shared/templates/success-modal/success-modal.component';

import { SortColumn } from '../../../shared/directives/sortable/sortable.directive';

import { ProspeccoesService } from '../../../core/services/prospeccoes/prospeccoes.service';

import { IProspeccaoTableData } from '../../../core/interfaces/prospeccao.interface';

@Component({
  selector: 'siscap-prospeccoes-list',
  standalone: false,
  templateUrl: './prospeccoes-list.component.html',
  styleUrl: './prospeccoes-list.component.scss',
})
export class ProspeccoesListComponent {
  public prospeccoesList = input<Array<IProspeccaoTableData> | null>([]);
  public sortableDirectiveOutput = output<string>();

  constructor(
    private readonly _router: Router,
    private readonly _prospeccoesService: ProspeccoesService,
    private readonly _ngbModalService: NgbModal
  ) {}

  public preencherIdAteQuatroDigitos(id: number): string {
    const idAsString = id.toString();

    return idAsString.length < 4 ? idAsString.padStart(4, '0') : idAsString;
  }

  public formatarSiglaObjetoCartaConsulta(objetoCartaConsulta: string): string {
    return objetoCartaConsulta.split(' ')[0];
  }

  public sortColumn(event: SortColumn): void {
    this.sortableDirectiveOutput.emit(`${event.column},${event.direction}`);
  }

  public tableActionOutputEvent(event: { acao: string; id: number }): void {
    switch (event.acao) {
      case 'editar':
        this.editarProspeccao(event.id);
        break;

      case 'deletar':
        this.deletarProspeccao(event.id);
        break;

      default:
        break;
    }
  }

  public visualizarProspeccao(id: number): void {
    this._prospeccoesService.idProspeccaoDetalhes$.next(id);

    this._router.navigate(['main', 'prospeccao', 'visualizar']);
  }

  public editarProspeccao(id: number): void {
    this._prospeccoesService.idProspeccao$.next(id);

    this._router.navigate(['main', 'prospeccao', 'editar']);
  }

  public deletarProspeccao(id: number): void {
    const prospeccaoTableData = this.prospeccoesList()?.find(
      (prospeccao) => prospeccao.id === id
    );

    this.dispararModalDeletar(prospeccaoTableData!);
  }

  private dispararModalDeletar(
    prospeccaoTableData: IProspeccaoTableData
  ): void {
    const modalRef = this._ngbModalService.open(DeleteModalComponent, {
      centered: true,
      backdrop: 'static',
    });

    modalRef.componentInstance.conteudo = `${prospeccaoTableData.nomeOrganizacaoProspectada} - ${prospeccaoTableData.objetoCartaConsulta} - ${prospeccaoTableData.tipoOperacao}`;

    modalRef.result.then(
      (resolve) => {
        this._prospeccoesService
          .delete(prospeccaoTableData.id)
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
          .then(() => this._router.navigateByUrl('main/prospeccao'));
      }
    );
  }
}
