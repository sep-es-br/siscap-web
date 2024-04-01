import {
  Component,
  EventEmitter,
  Input,
  Output,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { ITableActionsDataInput } from '../../../shared/interfaces/table-actions-data-input.interface';

@Component({
  selector: 'table-action-buttons-template',
  standalone: false,
  templateUrl: './table-action-buttons.component.html',
  styleUrl: './table-action-buttons.component.scss',
})
export class TableActionButtonsComponent {
  @ViewChild('deleteModalTemplate')
  deleteModalTemplate!: TemplateRef<NgbActiveModal>;

  @Input('rowData') rowData!: ITableActionsDataInput;
  @Output('deleteId') deleteId: EventEmitter<number> =
    new EventEmitter<number>();

  constructor(
    private _router: Router,
    private _route: ActivatedRoute,
    private _modalService: NgbModal
  ) {}

  private tableNavigation(data: ITableActionsDataInput, formMode: string) {
    this._router.navigate(['form', formMode], {
      relativeTo: this._route,
      queryParams: { id: data.id },
    });
  }

  public tableDetails(data: ITableActionsDataInput) {
    this.tableNavigation(data, 'detalhes');
  }

  public tableEdit(data: ITableActionsDataInput) {
    this.tableNavigation(data, 'editar');
  }

  public tableDelete(data: ITableActionsDataInput) {
    const deleteModalRef = this._modalService.open(this.deleteModalTemplate);

    deleteModalRef.result.then(
      (deleteId) => {
        this.deleteId.emit(deleteId);
      },
      () => {}
    );
  }
}
