import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavMenuComponent } from './navmenu/navmenu.component';
import { HeaderComponent } from './header/header.component';
import { BreadcrumbComponent } from './breadcrumb/breadcrumb.component';
import { AlertComponent } from './alert/alert.component';
import { DataTableComponent } from './data-table/data-table.component';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { LoadingComponent } from './loading/loading.component';
import { BreadcrumbnavlinkPipe } from '../pipes/breadcrumbnavlink.pipe';
import { DataTablesModule } from 'angular-datatables';
import { NewDataTableComponent } from './new-data-table/new-data-table.component';

@NgModule({
  declarations: [
    NavMenuComponent,
    HeaderComponent,
    BreadcrumbComponent,
    AlertComponent,
    DataTableComponent,
    NewDataTableComponent,
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
    DataTableComponent,
    NewDataTableComponent,
    LoadingComponent,
  ],
})
export class ComponentsModule {}
