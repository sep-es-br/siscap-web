import { Component, input, output } from '@angular/core';
import { Router } from '@angular/router';

import { tap } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { DeleteModalComponent } from '../../../shared/templates/delete-modal/delete-modal.component';
import { SuccessModalComponent } from '../../../shared/templates/success-modal/success-modal.component';

import { SortColumn } from '../../../shared/directives/sortable/sortable.directive';

import { CartasConsultaService } from '../../../core/services/cartas-consulta/cartas-consulta.service';

import { ICartaConsultaTableData } from '../../../core/interfaces/carta-consulta.interface';

@Component({
  selector: 'siscap-cartas-consulta-list',
  standalone: false,
  templateUrl: './cartas-consulta-list.component.html',
  styleUrl: './cartas-consulta-list.component.scss',
})
export class CartasConsultaListComponent {
  public cartasConsultaList = input<Array<ICartaConsultaTableData> | null>([]);
  public sortableDirectiveOutput = output<string>();

  constructor(
    private readonly _router: Router,
    private readonly _cartasConsultaService: CartasConsultaService,
    private readonly _ngbModalService: NgbModal
  ) {}

  public preencherIdAteQuatroDigitos(id: number): string {
    const idAsString = id.toString();

    return idAsString.length < 4 ? idAsString.padStart(4, '0') : idAsString;
  }

  public sortColumn(event: SortColumn): void {
    this.sortableDirectiveOutput.emit(`${event.column},${event.direction}`);
  }

  public tableActionOutputEvent(event: { acao: string; id: number }): void {
    switch (event.acao) {
      case 'editar':
        this.editarCartaConsulta(event.id);
        break;

      case 'deletar':
        this.deletarCartaConsulta(event.id);
        break;

      default:
        break;
    }
  }

  public visualizarCartaConsulta(id: number): void {
    this._cartasConsultaService.idCartaConsultaDetalhes$.next(id);

    this._router.navigate(['main', 'cartasconsulta', 'visualizar']);
  }

  public editarCartaConsulta(id: number): void {
    this._cartasConsultaService.idCartaConsulta$.next(id);

    this._router.navigate(['main', 'cartasconsulta', 'editar']);
  }

  public deletarCartaConsulta(id: number): void {
    const cartaConsultaTableData = this.cartasConsultaList()?.find(
      (cartaConsulta) => cartaConsulta.id === id
    );

    this.dispararModalDeletar(cartaConsultaTableData!);
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
          .delete(cartaConsultaTableData.id)
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
          .then(() => this._router.navigateByUrl('main/cartasconsulta'));
      }
    );
  }
}
