import { NgModule } from '@angular/core';

import { ComponentsModule } from './components/components.module';
import { PipesModule } from './pipes/pipes.module';
import { DirectivesModule } from './directives/directives.module';
import { TemplatesModule } from './templates/templates.module';

@NgModule({
  imports: [ComponentsModule, PipesModule, DirectivesModule, TemplatesModule],
  exports: [ComponentsModule, PipesModule, DirectivesModule, TemplatesModule],
})
export class CoreModule {}
