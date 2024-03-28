import { NgModule } from '@angular/core';
import { TableActionButtonsComponent } from './table-action-buttons/table-action-buttons.component';
import { ConfirmModalComponent } from './confirm-modal/confirm-modal.component';
import { CommonModule, KeyValuePipe } from '@angular/common';

@NgModule({
  declarations: [TableActionButtonsComponent, ConfirmModalComponent],
  imports: [CommonModule],
  providers: [KeyValuePipe],
  exports: [TableActionButtonsComponent, ConfirmModalComponent],
})
export class TemplatesModule {}
