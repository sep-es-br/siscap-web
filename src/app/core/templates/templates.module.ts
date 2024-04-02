import { NgModule } from '@angular/core';
import { CommonModule, KeyValuePipe } from '@angular/common';

import { TableActionButtonsComponent } from './table-action-buttons/table-action-buttons.component';

@NgModule({
  declarations: [TableActionButtonsComponent],
  imports: [CommonModule],
  providers: [KeyValuePipe],
  exports: [TableActionButtonsComponent],
})
export class TemplatesModule {}