import { NgModule } from '@angular/core';

import { ComponentsModule } from './components/components.module';
import { PipesModule } from './pipes/pipes.module';
import { DirectivesModule } from './directives/directives.module';

@NgModule({
  imports: [ComponentsModule, PipesModule, DirectivesModule],
  exports: [ComponentsModule, PipesModule, DirectivesModule],
})
export class CoreModule {}