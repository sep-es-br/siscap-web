import {
  AfterViewInit,
  Component,
  Input,
  OnChanges,
  SimpleChanges,
} from '@angular/core';

import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'siscap-confirm-modal',
  standalone: false,
  templateUrl: './confirm-modal.component.html',
  styleUrl: './confirm-modal.component.scss',
})
export class ConfirmModalComponent implements AfterViewInit {
  @Input() modalBodyDataInput: any;

  public modalBodyData: Array<string> = [];

  public confirmModalInstance: NgbActiveModal;

  constructor(private _activeModal: NgbActiveModal) {
    this.confirmModalInstance = this._activeModal;
  }

  ngAfterViewInit(): void {
    console.log(this.modalBodyDataInput);
    // this.modalBodyData = this.prepareModalBodyData(this.modalBodyDataInput);
    this.prepareModalBodyData(this.modalBodyDataInput);
  }

  private prepareModalBodyData(dataInput: any) {
    let propArray = [];

    for (const key in dataInput) {
      if (key != 'id') {
        console.log(key);
        console.log(dataInput[key]);

        // tratar keys e dar push no propArray; retornar o array
      }
    }
  }
}
