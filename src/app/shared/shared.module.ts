import { TableComponent } from './components/table/table.component';
import { TableCellDirective } from './components/table/table-cell.directive';
import { NgModule } from '@angular/core';

import { ComponentsModule } from './components/components.module';
import { PipesModule } from './pipes/pipes.module';
import { DirectivesModule } from './directives/directives.module';
import { TemplatesModule } from './templates/templates.module';

@NgModule({
  imports: [TableComponent, TableCellDirective, ComponentsModule, PipesModule, DirectivesModule, TemplatesModule],
  exports: [TableComponent, TableCellDirective, ComponentsModule, PipesModule, DirectivesModule, TemplatesModule],
})
export class SharedModule {}
