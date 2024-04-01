import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';

import { NgbToastModule } from '@ng-bootstrap/ng-bootstrap';

import { NavMenuComponent } from './navmenu/navmenu.component';
import { HeaderComponent } from './header/header.component';
import { BreadcrumbComponent } from './breadcrumb/breadcrumb.component';
import { AlertComponent } from './alert/alert.component';
import { LoadingComponent } from './loading/loading.component';
import { ToastComponent } from './toast/toast.component';
import { PipesModule } from '../pipes/pipes.module';

@NgModule({
  declarations: [
    NavMenuComponent,
    HeaderComponent,
    BreadcrumbComponent,
    AlertComponent,
    LoadingComponent,
    ToastComponent
  ],
  imports: [CommonModule, RouterModule, PipesModule, NgbToastModule],
  exports: [
    NavMenuComponent,
    HeaderComponent,
    BreadcrumbComponent,
    AlertComponent,
    LoadingComponent,
    ToastComponent
  ],
  providers: [CurrencyPipe, DatePipe],
})
export class ComponentsModule {}
