import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

import {
  NgbDropdownModule,
  NgbToastModule,
  NgbModule,
  NgbTooltipModule,
  NgbAlertModule,
} from '@ng-bootstrap/ng-bootstrap';

import { PipesModule } from '../pipes/pipes.module';

import { NavMenuComponent } from './navmenu/navmenu.component';
import { HeaderComponent } from './header/header.component';
import { BreadcrumbComponent } from './breadcrumb/breadcrumb.component';
import { AlertComponent } from './alert/alert.component';
import { LoadingComponent } from './loading/loading.component';
import { ToastComponent } from './toast/toast.component';
import { CrudModule } from './crud/crud.module';
import { CropperComponent } from './cropper/cropper.component';
import { EquipeFormComponent } from './equipe-form/equipe-form.component';
import { RateioFormComponent } from './rateio-form/rateio-form.component';
import { RateioMicrorregiaoItemCardComponent } from './rateio-form/rateio-microrregiao-item-card/rateio-microrregiao-item-card.component';
import { RateioCidadeItemCardComponent } from './rateio-form/rateio-cidade-item-card/rateio-cidade-item-card.component';

@NgModule({
  declarations: [
    NavMenuComponent,
    HeaderComponent,
    BreadcrumbComponent,
    AlertComponent,
    LoadingComponent,
    ToastComponent,
  ],
  imports: [
    CommonModule,
    RouterModule,
    PipesModule,
    EquipeFormComponent,
    RateioFormComponent,
    RateioMicrorregiaoItemCardComponent,
    RateioCidadeItemCardComponent,
    NgbToastModule,
    NgbDropdownModule,
    NgbModule,
    CrudModule,
    CropperComponent,
    NgbTooltipModule,
    NgbAlertModule,
  ],
  exports: [
    NavMenuComponent,
    HeaderComponent,
    BreadcrumbComponent,
    AlertComponent,
    LoadingComponent,
    ToastComponent,
    EquipeFormComponent,
    RateioFormComponent,
    RateioMicrorregiaoItemCardComponent,
    RateioCidadeItemCardComponent,
    CrudModule,
    CropperComponent,
  ],
})
export class ComponentsModule {}
