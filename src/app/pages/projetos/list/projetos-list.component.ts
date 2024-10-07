import { Component, input, output } from '@angular/core';
import { Router } from '@angular/router';

import { tap } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { DeleteModalComponent } from '../../../shared/templates/delete-modal/delete-modal.component';
import { SuccessModalComponent } from '../../../shared/templates/success-modal/success-modal.component';

import { SortColumn } from '../../../shared/directives/sortable/sortable.directive';

import { ProjetosService } from '../../../core/services/projetos/projetos.service';

import { IProjetoTableData } from '../../../core/interfaces/projeto.interface';

import { getSimboloMoeda } from '../../../core/utils/functions';

@Component({
  selector: 'siscap-projetos-list',
  standalone: false,
  templateUrl: './projetos-list.component.html',
  styleUrl: './projetos-list.component.scss',
})
export class ProjetosListComponent {
  public projetosList = input<Array<IProjetoTableData> | null>([]);
  public sortableDirectiveOutput = output<string>();

  public getSimboloMoeda: (moeda: string | undefined | null) => string =
    getSimboloMoeda;

  constructor(
    private _router: Router,
    private _projetosService: ProjetosService,
    private _ngbModalService: NgbModal
  ) {}

  public sortColumn(event: SortColumn): void {
    this.sortableDirectiveOutput.emit(`${event.column},${event.direction}`);
  }

  public tableActionOutputEvent(event: { acao: string; id: number }): void {
    switch (event.acao) {
      case 'editar':
        this.editarProjeto(event.id);
        break;

      case 'deletar':
        this.deletarProjeto(event.id);
        break;

      default:
        break;
    }
  }

  public editarProjeto(id: number): void {
    this._projetosService.idProjeto$.next(id);

    this._router.navigate(['main', 'projetos', 'editar']);
  }

  private deletarProjeto(id: number): void {
    const projetoTableData = this.projetosList()?.find(
      (projeto) => projeto.id === id
    );

    this.dispararModalDeletar(projetoTableData!);
  }

  private dispararModalDeletar(projetoTableData: IProjetoTableData): void {
    const modalRef = this._ngbModalService.open(DeleteModalComponent, {
      centered: true,
    });

    modalRef.componentInstance.conteudo = `${projetoTableData.sigla} - ${projetoTableData.titulo}`;

    modalRef.result.then(
      (resolve) => {
        this._projetosService
          .delete(projetoTableData.id)
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
          .then(() => this._router.navigateByUrl('main/projetos'));
      }
    );
  }
}
