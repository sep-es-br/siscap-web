import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HeaderComponent } from './header/header.component';
import { ToastComponent } from './toast/toast.component';
import { NavMenuComponent } from './nav-menu/nav-menu.component';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { BreadcrumbComponent } from './breadcrumb/breadcrumb.component';
import { TableSearchComponent } from './table-search/table-search.component';
import { PaginationComponent } from './pagination/pagination.component';
import { TextEditorComponent } from './text-editor/text-editor.component';
import { EquipeFormComponent } from './equipe-form/equipe-form.component';
import { ValorFormComponent } from './valor-form/valor-form.component';
import { RateioFormComponent } from './rateio-form/rateio-form.component';
import { CropperComponent } from './cropper/cropper.component';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    HeaderComponent,
    ToastComponent,
    NavMenuComponent,
    UserProfileComponent,
    BreadcrumbComponent,
    TableSearchComponent,
    PaginationComponent,
    TextEditorComponent,
    EquipeFormComponent,
    ValorFormComponent,
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
    TextEditorComponent,
    EquipeFormComponent,
    ValorFormComponent,
    RateioFormComponent,
    CropperComponent,
  ],
})
export class ComponentsModule {}
