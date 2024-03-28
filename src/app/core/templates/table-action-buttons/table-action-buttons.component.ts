import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { ConfirmModalComponent } from '../confirm-modal/confirm-modal.component';

@Component({
  selector: 'siscap-table-action-buttons',
  standalone: false,
  templateUrl: './table-action-buttons.component.html',
  styleUrl: './table-action-buttons.component.scss',
})
export class TableActionButtonsComponent {
  @Input('rowData') rowData: any;
  @Output('deleteId') deleteId: EventEmitter<number> =
    new EventEmitter<number>();

  public confirmModal: typeof ConfirmModalComponent = ConfirmModalComponent;

  constructor(
    private _router: Router,
    private _route: ActivatedRoute,
    private _modalService: NgbModal
  ) {}

  private tableNavigation(data: any, formMode: string) {
    this._router.navigate(['form', formMode], {
      relativeTo: this._route,
      queryParams: { id: data.id },
    });
  }

  public tableDetails(data: any) {
    this.tableNavigation(data, 'detalhes');
  }

  public tableEdit(data: any) {
    this.tableNavigation(data, 'editar');
  }

  public tableDelete(data: any) {
    const confirmModalRef = this._modalService.open(this.confirmModal);
    confirmModalRef.componentInstance.modalBodyDataInput = data;

    // this.deleteId.emit(data.id);
  }

  // public actionEvent(type: string, data: any) {
  //   switch (type) {
  //     case 'detalhes':
  //       this.tableDetails(data);
  //       break;
  //     case 'editar':
  //       this.tableEdit(data);
  //       break;
  //     case 'deletar':
  //       this.tableDelete(data);
  //       break;

  //     default:
  //       break;
  //   }
  // }
}
