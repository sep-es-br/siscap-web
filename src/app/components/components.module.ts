import { NgModule } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';

import { NavMenuComponent } from './navmenu/navmenu.component';
import { HeaderComponent } from './header/header.component';
import { BreadcrumbComponent } from './breadcrumb/breadcrumb.component';
import { AlertComponent } from './alert/alert.component';
import { LoadingComponent } from './loading/loading.component';
import { BreadcrumbnavlinkPipe } from '../pipes/breadcrumbnavlink.pipe';

@NgModule({
  declarations: [
    NavMenuComponent,
    HeaderComponent,
    BreadcrumbComponent,
    AlertComponent,
    LoadingComponent,
  ],
  imports: [
    CommonModule,
    BreadcrumbnavlinkPipe,
  ],
  exports: [
    NavMenuComponent,
    HeaderComponent,
    BreadcrumbComponent,
    AlertComponent,
    LoadingComponent,
  ],
  providers: [CurrencyPipe, DatePipe],
})
export class ComponentsModule {}
