import { Component, input, output } from '@angular/core';

import { tap } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { PreventActionModalComponent } from '../../../shared/templates/prevent-action-modal/prevent-action-modal.component';
import { DeleteModalComponent } from '../../../shared/templates/delete-modal/delete-modal.component';
import { SuccessModalComponent } from '../../../shared/templates/success-modal/success-modal.component';

import { SortColumn } from '../../../shared/directives/sortable/sortable.directive';

import { ProspeccoesService } from '../../../core/services/prospeccoes/prospeccoes.service';
import { NavegacaoService } from '../../../core/services/navegacao/navegacao.service';

import { IProspeccaoTableData } from '../../../core/interfaces/prospeccao.interface';
import {
  ITableActionOutput,
  TTableActions,
} from '../../../shared/templates/table-actions-dropdown/table-actions-dropdown.interface';

import { StatusProspeccaoEnum } from '../../../core/enums/status-prospeccao.enum';
import {
  BreadcrumbAcoesEnum,
  BreadcrumbContextoEnum,
} from '../../../core/enums/breadcrumb.enum';

@Component({
  selector: 'siscap-prospeccoes-list',
  standalone: false,
  templateUrl: './prospeccoes-list.component.html',
  styleUrl: './prospeccoes-list.component.scss',
})
export class ProspeccoesListComponent {
  private readonly _textoConteudoPrevinirAcaoModal: Partial<
    Record<TTableActions, string>
  > = {
    editar:
      'Não é possível alterar os dados de uma prospecção que já foi prospectada.',
    deletar: 'Não é possível excluir uma prospecção que já foi prospectada.',
  };

  public prospeccoesList = input<Array<IProspeccaoTableData> | null>([]);
  public sortableDirectiveOutput = output<string>();

  constructor(
    private readonly _prospeccoesService: ProspeccoesService,
    private readonly _navegacaoService: NavegacaoService,
    private readonly _ngbModalService: NgbModal
  ) {}

  public formatarSiglaObjetoCartaConsulta(objetoCartaConsulta: string): string {
    return objetoCartaConsulta.split(' - ')[0];
  }

  public sortColumn(event: SortColumn): void {
    this.sortableDirectiveOutput.emit(`${event.column},${event.direction}`);
  }

  public tableActionOutputEvent(event: ITableActionOutput): void {
    const prospeccaoTableData = this.buscarProspeccaoTableDataPorId(event.id);
    const checkStatusProspeccao =
      prospeccaoTableData.statusProspeccao === StatusProspeccaoEnum.Prospectado;

    switch (event.acao) {
      case 'editar':
        if (checkStatusProspeccao) {
          this.dispararModalPrevinirAcao('editar');
        } else {
          this.editarProspeccao(event.id);
        }
        break;

      case 'deletar':
        if (checkStatusProspeccao) {
          this.dispararModalPrevinirAcao('deletar');
        } else {
          this.dispararModalDeletar(prospeccaoTableData);
        }
        break;

      default:
        break;
    }
  }

  public visualizarProspeccao(id: number): void {
    this._prospeccoesService.idProspeccaoDetalhes$.next(id);

    this._navegacaoService.navegacaoSimples(
      BreadcrumbContextoEnum.Prospeccao,
      BreadcrumbAcoesEnum.Visualizar
    );
  }

  private editarProspeccao(id: number): void {
    this._prospeccoesService.idProspeccao$.next(id);

    this._navegacaoService.navegacaoSimples(
      BreadcrumbContextoEnum.Prospeccao,
      BreadcrumbAcoesEnum.Editar
    );
  }

  private dispararModalPrevinirAcao(acao: TTableActions): void {
    const modalRef = this._ngbModalService.open(PreventActionModalComponent, {
      centered: true,
    });

    modalRef.componentInstance.conteudo =
      this._textoConteudoPrevinirAcaoModal[acao];

    modalRef.result.then(
      (resolve) => {},
      (reject) => {}
    );
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
          .deleteById(prospeccaoTableData.id)
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
        this._navegacaoService.navegacaoComRecarregamento(
          BreadcrumbContextoEnum.Prospeccao
        );
      }
    );
  }

  private buscarProspeccaoTableDataPorId(id: number): IProspeccaoTableData {
    return this.prospeccoesList()?.find((prospeccao) => prospeccao.id === id)!;
  }
}
