import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';

import { NgSelectModule } from '@ng-select/ng-select';
import { DataTablesModule } from 'angular-datatables';
import { NgxMaskDirective, NgxMaskPipe, provideNgxMask } from 'ngx-mask';

import { LoginComponent } from '../pages/login/login.component';
import { HomeComponent } from '../pages/home/home.component';
import { ComponentsModule } from '../components/components.module';
import { ProjectsComponent } from './projects/projects.component';
import { ProjectFormComponent } from './projects/form/project-form.component';
import { MainComponent } from './main/main.component';
import { PagesRoutingModule } from './pages-routing.module';
import { AuthRedirectComponent } from './auth-redirect/auth-redirect.component';
import { PersonsComponent } from './persons/persons.component';
import { PersonFormComponent } from './persons/form/person-form.component';

@NgModule({
  declarations: [
    LoginComponent,
    AuthRedirectComponent,
    MainComponent,
    HomeComponent,
    ProjectsComponent,
    ProjectFormComponent,
    PersonsComponent,
    PersonFormComponent,
  ],
  imports: [
    CommonModule,
    RouterOutlet,
    ComponentsModule,
    ReactiveFormsModule,
    DataTablesModule,
    HttpClientModule,
    NgSelectModule,
    NgxMaskDirective,
    NgxMaskPipe,
    FormsModule,
    PagesRoutingModule,
  ],
  providers: [provideNgxMask()],
  exports: [
    LoginComponent,
    AuthRedirectComponent,
    MainComponent,
    HomeComponent,
    ProjectsComponent,
    ProjectFormComponent,
    PersonsComponent,
    PersonFormComponent,
  ],
})
export class PagesModule {}
