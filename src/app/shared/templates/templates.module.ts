import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NgbAlertModule, NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';

import { DeleteModalComponent } from './delete-modal/delete-modal.component';
import { LoadingSpinnerComponent } from './loading-spinner/loading-spinner.component';
import { OrganizationResponsibleChangeWarningModalComponent } from './organization-responsible-change-warning-modal/organization-responsible-change-warning-modal.component';
import { QueryNoResultsComponent } from './query-no-results/query-no-results.component';
import { SuccessModalComponent } from './success-modal/success-modal.component';
import { TableActionsDropdownComponent } from './table-actions-dropdown/table-actions-dropdown.component';
import { ValidationMessageComponent } from './validation-message/validation-message.component';

@NgModule({
  declarations: [
    DeleteModalComponent,
    LoadingSpinnerComponent,
    OrganizationResponsibleChangeWarningModalComponent,
    QueryNoResultsComponent,
    SuccessModalComponent,
    TableActionsDropdownComponent,
    ValidationMessageComponent,
  ],
  imports: [CommonModule, NgbDropdownModule, NgbAlertModule],
  exports: [
    DeleteModalComponent,
    LoadingSpinnerComponent,
    OrganizationResponsibleChangeWarningModalComponent,
    QueryNoResultsComponent,
    SuccessModalComponent,
    TableActionsDropdownComponent,
    ValidationMessageComponent,
  ],
})
export class TemplatesModule {}
