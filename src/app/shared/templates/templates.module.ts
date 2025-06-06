import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  NgbAlertModule,
  NgbDropdownModule,
  NgbTooltipModule,
} from '@ng-bootstrap/ng-bootstrap';

import { DeleteModalComponent } from './delete-modal/delete-modal.component';
import { LoadingSpinnerComponent } from './loading-spinner/loading-spinner.component';
import { OrganizationResponsibleChangeWarningModalComponent } from './organization-responsible-change-warning-modal/organization-responsible-change-warning-modal.component';
import { QueryNoResultsComponent } from './query-no-results/query-no-results.component';
import { SuccessModalComponent } from './success-modal/success-modal.component';
import { TableActionsDropdownComponent } from './table-actions-dropdown/table-actions-dropdown.component';
import { ValidationMessageComponent } from './validation-message/validation-message.component';
import { ProgramaProjetoPropostoVinculadoWarningModalComponent } from './programa-projeto-proposto-vinculado-warning-modal/programa-projeto-proposto-vinculado-warning-modal.component';
import { BotaoComponent } from '../components/botao/botao.component';
import { PreventActionModalComponent } from './prevent-action-modal/prevent-action-modal.component';
import { FormHelperTooltipComponent } from './form-helper-tooltip/form-helper-tooltip.component';

@NgModule({
  declarations: [
    DeleteModalComponent,
    LoadingSpinnerComponent,
    OrganizationResponsibleChangeWarningModalComponent,
    ProgramaProjetoPropostoVinculadoWarningModalComponent,
    QueryNoResultsComponent,
    SuccessModalComponent,
    TableActionsDropdownComponent,
    PreventActionModalComponent,
    ValidationMessageComponent,
    FormHelperTooltipComponent,
  ],
  imports: [
    CommonModule,
    BotaoComponent,
    NgbDropdownModule,
    NgbAlertModule,
    NgbTooltipModule,
  ],
  exports: [
    DeleteModalComponent,
    LoadingSpinnerComponent,
    OrganizationResponsibleChangeWarningModalComponent,
    ProgramaProjetoPropostoVinculadoWarningModalComponent,
    QueryNoResultsComponent,
    SuccessModalComponent,
    PreventActionModalComponent,
    TableActionsDropdownComponent,
    ValidationMessageComponent,
    FormHelperTooltipComponent,
  ],
})
export class TemplatesModule {}
