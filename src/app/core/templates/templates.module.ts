import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableActionsDropdownComponent } from './table-actions-dropdown/table-actions-dropdown.component';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { BaseModalComponent } from './base-modal/base-modal.component';

@NgModule({
  declarations: [TableActionsDropdownComponent, BaseModalComponent],
  imports: [CommonModule, NgbDropdownModule],
  exports: [TableActionsDropdownComponent, BaseModalComponent],
})
export class TemplatesModule {}
