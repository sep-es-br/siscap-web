import { Component, input, output } from '@angular/core';
import { Router } from '@angular/router';

import { tap } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { DeleteModalComponent } from '../../../shared/templates/delete-modal/delete-modal.component';
import { SuccessModalComponent } from '../../../shared/templates/success-modal/success-modal.component';

import { SortColumn } from '../../../shared/directives/sortable/sortable.directive';

import { ProgramasService } from '../../../core/services/programas/programas.service';

import { IProgramaTableData } from '../../../core/interfaces/programa.interface';

import { MoedaHelper } from '../../../core/helpers/moeda.helper';

@Component({
  selector: 'siscap-programas-list',
  standalone: false,
  templateUrl: './programas-list.component.html',
  styleUrl: './programas-list.component.scss',
})
export class ProgramasListComponent {
  public programasList = input<Array<IProgramaTableData> | null>([]);
  public sortableDirectiveOutput = output<string>();

  constructor(
    private _router: Router,
    private _programasService: ProgramasService,
    private _ngbModalService: NgbModal
  ) {}

  public getSimbolo(codigoMoeda: string): string {
    return MoedaHelper.getSimbolo(codigoMoeda);
  }

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

    this._router.navigate(['main', 'programas', 'editar']);
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
          .delete(programaTableData.id)
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
          .then(() => this._router.navigateByUrl('main/programas'));
      }
    );
  }
}
