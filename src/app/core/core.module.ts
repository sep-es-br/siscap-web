import { NgModule } from '@angular/core';

import { ComponentsModule } from './components/components.module';
import { PipesModule } from './pipes/pipes.module';
import { TemplatesModule } from './templates/templates.module';
import { DirectivesModule } from './directives/directives.module';

@NgModule({
  imports: [ComponentsModule, PipesModule, TemplatesModule, DirectivesModule],
  exports: [ComponentsModule, PipesModule, TemplatesModule, DirectivesModule],
})
export class CoreModule {}