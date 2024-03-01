import { NgModule } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { NavMenuComponent } from './navmenu/navmenu.component';
import { HeaderComponent } from './header/header.component';
import { BreadcrumbComponent } from './breadcrumb/breadcrumb.component';
import { AlertComponent } from './alert/alert.component';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { LoadingComponent } from './loading/loading.component';
import { BreadcrumbnavlinkPipe } from '../pipes/breadcrumbnavlink.pipe';
import { DataTablesModule } from 'angular-datatables';
import { DatatableComponent } from './datatable/datatable.component';

@NgModule({
  declarations: [
    NavMenuComponent,
    HeaderComponent,
    BreadcrumbComponent,
    AlertComponent,
    DatatableComponent,
    LoadingComponent,
  ],
  imports: [
    CommonModule,
    NgxDatatableModule,
    DataTablesModule,
    BreadcrumbnavlinkPipe,
  ],
  exports: [
    NavMenuComponent,
    HeaderComponent,
    BreadcrumbComponent,
    AlertComponent,
    DatatableComponent,
    LoadingComponent,
  ],
  providers: [CurrencyPipe, DatePipe],
})
export class ComponentsModule {}
