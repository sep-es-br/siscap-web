import { Component, input, output } from '@angular/core';
import { Router } from '@angular/router';

import { tap } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { DeleteModalComponent } from '../../../shared/templates/delete-modal/delete-modal.component';
import { SuccessModalComponent } from '../../../shared/templates/success-modal/success-modal.component';

import { SortColumn } from '../../../shared/directives/sortable/sortable.directive';

import { PessoasService } from '../../../core/services/pessoas/pessoas.service';

import { IPessoaTableData } from '../../../core/interfaces/pessoa.interface';

import { converterArrayBufferEmImgSrc } from '../../../core/utils/functions';

@Component({
  selector: 'siscap-pessoas-list',
  standalone: false,
  templateUrl: './pessoas-list.component.html',
  styleUrl: './pessoas-list.component.scss',
})
export class PessoasListComponent {
  public pessoasList = input<Array<IPessoaTableData> | null>([]);
  public sortableDirectiveOutput = output<string>();

  public converterArrayBufferEmImgSrc: (
    imgArrayBuffer: ArrayBuffer | null
  ) => string = converterArrayBufferEmImgSrc;

  constructor(
    private _router: Router,
    private _pessoasService: PessoasService,
    private _ngbModalService: NgbModal
  ) {}

  public sortColumn(event: SortColumn): void {
    this.sortableDirectiveOutput.emit(`${event.column},${event.direction}`);
  }

  public tableActionOutputEvent(event: { acao: string; id: number }): void {
    switch (event.acao) {
      case 'editar':
        this.editarPessoa(event.id);
        break;

      case 'deletar':
        this.deletarPessoa(event.id);
        break;

      default:
        break;
    }
  }

  public editarPessoa(id: number): void {
    this._pessoasService.idPessoa$.next(id);

    this._router.navigate(['main', 'pessoas', 'editar']);
  }

  private deletarPessoa(id: number): void {
    const pessoaTableData = this.pessoasList()?.find(
      (pessoa) => pessoa.id === id
    );

    this.dispararModalDeletar(pessoaTableData!);
  }

  private dispararModalDeletar(pessoaTableData: IPessoaTableData): void {
    const modalRef = this._ngbModalService.open(DeleteModalComponent, {
      centered: true,
    });

    modalRef.componentInstance.conteudo = `${pessoaTableData.nome}`;

    modalRef.result.then(
      (resolve) => {
        this._pessoasService
          .delete(pessoaTableData.id)
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
          .then(() => this._router.navigateByUrl('main/pessoas'));
      }
    );
  }
}
