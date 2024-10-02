import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';

import { NgSelectModule } from '@ng-select/ng-select';
import { NgxMaskDirective, NgxMaskPipe, provideNgxMask } from 'ngx-mask';
import {
  NgbAccordionModule,
  NgbDropdownModule,
  NgbPaginationModule,
  NgbTooltipModule,
} from '@ng-bootstrap/ng-bootstrap';

import { SharedModule } from '../shared/shared.module';

import { LoginComponent } from '../pages/login/login.component';
import { AuthRedirectComponent } from './auth-redirect/auth-redirect.component';
import { MainComponent } from './main/main.component';
import { HomeComponent } from '../pages/home/home.component';
import { DashboardComponent } from './home/dashboard/dashboard.component';

import { PagesRoutingModule } from './pages-routing.module';

@NgModule({
  declarations: [
    LoginComponent,
    AuthRedirectComponent,
    MainComponent,
    HomeComponent,
    DashboardComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    RouterOutlet,
    NgSelectModule,
    NgxMaskDirective,
    NgxMaskPipe,
    NgbAccordionModule,
    NgbDropdownModule,
    NgbPaginationModule,
    NgbTooltipModule,
    PagesRoutingModule,
  ],
  providers: [provideNgxMask()],
  exports: [
    LoginComponent,
    AuthRedirectComponent,
    MainComponent,
    HomeComponent,
    DashboardComponent,
  ],
})
export class PagesModule {}
