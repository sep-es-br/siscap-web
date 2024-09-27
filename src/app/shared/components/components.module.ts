import { NgModule } from '@angular/core';
// import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

// import { PipesModule } from '../pipes/pipes.module';

import { HeaderComponent } from './header/header.component';
import { NavMenuComponent } from './nav-menu/nav-menu.component';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { BreadcrumbComponent } from './breadcrumb/breadcrumb.component';
import { EquipeFormComponent } from './equipe-form/equipe-form.component';
import { RateioFormComponent } from './rateio-form/rateio-form.component';
import { PaginationComponent } from './pagination/pagination.component';
import { TableSearchComponent } from './table-search/table-search.component';
import { ToastComponent } from './toast/toast.component';
import { CropperComponent } from './cropper/cropper.component';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    // RouterModule,
    // PipesModule,
    HeaderComponent,
    ToastComponent,
    NavMenuComponent,
    UserProfileComponent,
    BreadcrumbComponent,
    TableSearchComponent,
    PaginationComponent,
    EquipeFormComponent,
    RateioFormComponent,
    CropperComponent,
  ],
  exports: [
    HeaderComponent,
    ToastComponent,
    NavMenuComponent,
    UserProfileComponent,
    BreadcrumbComponent,
    TableSearchComponent,
    PaginationComponent,
    EquipeFormComponent,
    RateioFormComponent,
    CropperComponent,
  ],
})
export class ComponentsModule {}
