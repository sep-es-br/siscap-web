import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';

import { NgSelectModule } from '@ng-select/ng-select';
import { NgxMaskDirective, NgxMaskPipe, provideNgxMask } from 'ngx-mask';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';

import { CoreModule } from '../core/core.module';
import { PagesRoutingModule } from './pages-routing.module';

import { LoginComponent } from '../pages/login/login.component';
import { AuthRedirectComponent } from './auth-redirect/auth-redirect.component';
import { MainComponent } from './main/main.component';
import { HomeComponent } from '../pages/home/home.component';
import { DashboardComponent } from './home/dashboard/dashboard.component';
import { ProjectsComponent } from './projects/projects.component';
import { ProjectFormComponent } from './projects/form/project-form.component';
import { PersonsComponent } from './persons/persons.component';
import { PersonFormComponent } from './persons/form/person-form.component';
import { OrganizationsComponent } from './organizations/organizations.component';
import { OrganizationFormComponent } from './organizations/form/organization-form.component';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';

@NgModule({
  declarations: [
    LoginComponent,
    AuthRedirectComponent,
    MainComponent,
    HomeComponent,
    DashboardComponent,
    ProjectsComponent,
    ProjectFormComponent,
    PersonsComponent,
    PersonFormComponent,
    OrganizationsComponent,
    OrganizationFormComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterOutlet,
    NgSelectModule,
    NgxMaskDirective,
    NgxMaskPipe,
    NgbTooltipModule,
    SweetAlert2Module,
    CoreModule,
    PagesRoutingModule,
  ],
  providers: [provideNgxMask()],
  exports: [
    LoginComponent,
    AuthRedirectComponent,
    MainComponent,
    HomeComponent,
    DashboardComponent,
    ProjectsComponent,
    ProjectFormComponent,
    PersonsComponent,
    PersonFormComponent,
    OrganizationsComponent,
    OrganizationFormComponent,
  ],
})
export class PagesModule {}
