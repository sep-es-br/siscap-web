import { NgModule } from '@angular/core';

import { TableTextTruncatePipe } from './table-text-truncate/table-text-truncate.pipe';
import { NomeStatusProgramaPipe } from './programa-status/programa-status.pipe';

@NgModule({
  declarations: [],
  imports: [
    TableTextTruncatePipe,
    NomeStatusProgramaPipe,
  ],
  exports: [
    TableTextTruncatePipe,
    NomeStatusProgramaPipe,
  ],
})
export class PipesModule {}
