import { NgModule } from '@angular/core';

import { BreadcrumbNavLinkPipe } from './breadcrumb-nav-link/breadcrumb-nav-link.pipe';
import { TableTextTruncatePipe } from './table-text-truncate/table-text-truncate.pipe';

@NgModule({
  declarations: [],
  imports: [BreadcrumbNavLinkPipe, TableTextTruncatePipe],
  exports: [BreadcrumbNavLinkPipe, TableTextTruncatePipe],
})
export class PipesModule {}