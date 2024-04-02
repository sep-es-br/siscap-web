import { NgModule } from '@angular/core';

import { ComponentsModule } from './components/components.module';
import { PipesModule } from './pipes/pipes.module';
import { TemplatesModule } from './templates/templates.module';

@NgModule({
  imports: [ComponentsModule, PipesModule, TemplatesModule],
  exports: [ComponentsModule, PipesModule, TemplatesModule],
})
export class CoreModule {}