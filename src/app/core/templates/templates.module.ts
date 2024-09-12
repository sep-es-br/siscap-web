import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NgbAlertModule, NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';

import { TableActionsDropdownComponent } from './table-actions-dropdown/table-actions-dropdown.component';
import { DeleteModalComponent } from './delete-modal/delete-modal.component';
import { SuccessModalComponent } from './success-modal/success-modal.component';
import { TableSearchNoResultsComponent } from './no-results/table-search-no-results.component';

@NgModule({
  declarations: [
    TableActionsDropdownComponent,
    TableSearchNoResultsComponent,
    DeleteModalComponent,
    SuccessModalComponent,
  ],
  imports: [CommonModule, NgbDropdownModule, NgbAlertModule],
  exports: [
    TableActionsDropdownComponent,
    TableSearchNoResultsComponent,
    DeleteModalComponent,
    SuccessModalComponent,
  ],
})
export class TemplatesModule {}
