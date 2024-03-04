import { NgModule } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';

import { NgSelectModule } from '@ng-select/ng-select';

import { LoginComponent } from '../pages/login/login.component';
import { HomeComponent } from '../pages/home/home.component';
import { ComponentsModule } from '../components/components.module';
import { ProjectsComponent } from './projects/projects.component';
import { ProjectFormComponent } from './projects/form/project-form.component';
import { MainComponent } from './main/main.component';
import { PagesRoutingModule } from './pages-routing.module';
import { AuthRedirectComponent } from './auth-redirect/auth-redirect.component';
import { DataTablesModule } from 'angular-datatables';

@NgModule({
  declarations: [
    LoginComponent,
    MainComponent,
    HomeComponent,
    ProjectsComponent,
    ProjectFormComponent,
    AuthRedirectComponent,
  ],
  imports: [
    CommonModule,
    RouterOutlet,
    ComponentsModule,
    ReactiveFormsModule,
    DataTablesModule,
    HttpClientModule,
    NgSelectModule,
    FormsModule,
    PagesRoutingModule,
  ],
  providers: [CurrencyPipe, DatePipe],
  exports: [
    LoginComponent,
    MainComponent,
    HomeComponent,
    ProjectsComponent,
    ProjectFormComponent,
    AuthRedirectComponent,
  ],
})
export class PagesModule {}
