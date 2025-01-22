import { Component, input, output } from '@angular/core';

import { tap } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { DeleteModalComponent } from '../../../shared/templates/delete-modal/delete-modal.component';
import { SuccessModalComponent } from '../../../shared/templates/success-modal/success-modal.component';

import { SortColumn } from '../../../shared/directives/sortable/sortable.directive';

import { ProgramasService } from '../../../core/services/programas/programas.service';
import { NavegacaoService } from '../../../core/services/navegacao/navegacao.service';

import { IProgramaTableData } from '../../../core/interfaces/programa.interface';

import {
  BreadcrumbAcoesEnum,
  BreadcrumbContextoEnum,
} from '../../../core/enums/breadcrumb.enum';

import { getSimboloMoeda } from '../../../core/utils/functions';

@Component({
  selector: 'siscap-programas-list',
  standalone: false,
  templateUrl: './programas-list.component.html',
  styleUrl: './programas-list.component.scss',
})
export class ProgramasListComponent {
  public programasList = input<Array<IProgramaTableData> | null>([]);
  public sortableDirectiveOutput = output<string>();

  public getSimboloMoeda: (moeda: string | undefined | null) => string =
    getSimboloMoeda;

  constructor(
    private readonly _programasService: ProgramasService,
    private readonly _navegacaoService: NavegacaoService,
    private readonly _ngbModalService: NgbModal
  ) {}

  public sortColumn(event: SortColumn): void {
    this.sortableDirectiveOutput.emit(`${event.column},${event.direction}`);
  }

  public tableActionOutputEvent(event: { acao: string; id: number }): void {
    switch (event.acao) {
      case 'editar':
        this.editarPrograma(event.id);
        break;

      case 'deletar':
        this.deletarPrograma(event.id);
        break;

      default:
        break;
    }
  }

  public editarPrograma(id: number): void {
    this._programasService.idPrograma$.next(id);

    this._navegacaoService.navegacaoSimples(
      BreadcrumbContextoEnum.Programas,
      BreadcrumbAcoesEnum.Editar
    );
  }

  public deletarPrograma(id: number): void {
    const programaTableData = this.programasList()?.find(
      (programa) => programa.id === id
    );

    this.dispararModalDeletar(programaTableData!);
  }

  private dispararModalDeletar(programaTableData: IProgramaTableData): void {
    const modalRef = this._ngbModalService.open(DeleteModalComponent, {
      centered: true,
      backdrop: 'static',
    });

    modalRef.componentInstance.conteudo = `${programaTableData.sigla} - ${programaTableData.titulo}`;

    modalRef.result.then(
      (resolve) => {
        this._programasService
          .deleteById(programaTableData.id)
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
          BreadcrumbContextoEnum.Programas
        );
      }
    );
  }
}
