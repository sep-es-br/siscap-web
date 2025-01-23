import { Component, input, output } from '@angular/core';

import { tap } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { PreventActionModalComponent } from '../../../shared/templates/prevent-action-modal/prevent-action-modal.component';
import { DeleteModalComponent } from '../../../shared/templates/delete-modal/delete-modal.component';
import { SuccessModalComponent } from '../../../shared/templates/success-modal/success-modal.component';

import { SortColumn } from '../../../shared/directives/sortable/sortable.directive';

import { CartasConsultaService } from '../../../core/services/cartas-consulta/cartas-consulta.service';
import { NavegacaoService } from '../../../core/services/navegacao/navegacao.service';

import { ICartaConsultaTableData } from '../../../core/interfaces/carta-consulta.interface';
import {
  ITableActionOutput,
  TTableActions,
} from '../../../shared/templates/table-actions-dropdown/table-actions-dropdown.interface';

import {
  BreadcrumbAcoesEnum,
  BreadcrumbContextoEnum,
} from '../../../core/enums/breadcrumb.enum';

@Component({
  selector: 'siscap-cartas-consulta-list',
  standalone: false,
  templateUrl: './cartas-consulta-list.component.html',
  styleUrl: './cartas-consulta-list.component.scss',
})
export class CartasConsultaListComponent {
  private readonly _textoConteudoPrevinirAcaoModal: Partial<
    Record<TTableActions, string>
  > = {
    editar:
      'Não é possível alterar os dados de uma carta consulta pertencente á uma prospecção que já foi prospectada.',
    deletar:
      'Não é possível excluir uma carta consulta pertencente á uma prospecção que já foi prospectada.',
  };

  public cartasConsultaList = input<Array<ICartaConsultaTableData> | null>([]);
  public sortableDirectiveOutput = output<string>();

  constructor(
    private readonly _cartasConsultaService: CartasConsultaService,
    private readonly _navegacaoService: NavegacaoService,
    private readonly _ngbModalService: NgbModal
  ) {}

  public sortColumn(event: SortColumn): void {
    this.sortableDirectiveOutput.emit(`${event.column},${event.direction}`);
  }

  public tableActionOutputEvent(event: ITableActionOutput): void {
    const cartaConsultaTableData = this.buscarCartaConsultaTableDataPorId(
      event.id
    );

    switch (event.acao) {
      case 'editar':
        if (cartaConsultaTableData.prospectado) {
          this.dispararModalPrevinirAcao('editar');
        } else {
          this.editarCartaConsulta(event.id);
        }
        break;

      case 'deletar':
        if (cartaConsultaTableData.prospectado) {
          this.dispararModalPrevinirAcao('deletar');
        } else {
          this.dispararModalDeletar(cartaConsultaTableData);
        }
        break;

      default:
        break;
    }
  }

  public visualizarCartaConsulta(id: number): void {
    this._cartasConsultaService.idCartaConsultaDetalhes$.next(id);

    this._navegacaoService.navegacaoSimples(
      BreadcrumbContextoEnum.CartasConsulta,
      BreadcrumbAcoesEnum.Visualizar
    );
  }

  private editarCartaConsulta(id: number): void {
    this._cartasConsultaService.idCartaConsulta$.next(id);

    this._navegacaoService.navegacaoSimples(
      BreadcrumbContextoEnum.CartasConsulta,
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
    cartaConsultaTableData: ICartaConsultaTableData
  ): void {
    const modalRef = this._ngbModalService.open(DeleteModalComponent, {
      centered: true,
      backdrop: 'static',
    });

    modalRef.componentInstance.conteudo = `${cartaConsultaTableData.id} - ${cartaConsultaTableData.nomeObjeto}`;

    modalRef.result.then(
      (resolve) => {
        this._cartasConsultaService
          .deleteById(cartaConsultaTableData.id)
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
          BreadcrumbContextoEnum.CartasConsulta
        );
      }
    );
  }

  private buscarCartaConsultaTableDataPorId(
    id: number
  ): ICartaConsultaTableData {
    return this.cartasConsultaList()?.find(
      (cartaConsulta) => cartaConsulta.id === id
    )!;
  }
}
