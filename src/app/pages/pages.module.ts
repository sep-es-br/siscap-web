import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';

import { NgSelectModule } from '@ng-select/ng-select';

import { LoginComponent } from '../pages/login/login.component';
import { HomeComponent } from '../pages/home/home.component';
import { ComponentsModule } from '../components/components.module';
import { ProjectsComponent } from './projects/projects.component';
import { CreateComponent } from './projects/create/create.component';
import { MainComponent } from './main/main.component';
import { PagesRoutingModule } from './pages-routing.module';
import { AuthRedirectComponent } from './auth-redirect/auth-redirect.component';

@NgModule({
  declarations: [
    LoginComponent,
    MainComponent,
    HomeComponent,
    ProjectsComponent,
    CreateComponent,
    AuthRedirectComponent,
  ],
  imports: [
    CommonModule,
    RouterOutlet,
    ComponentsModule,
    ReactiveFormsModule,
    HttpClientModule,
    NgSelectModule,
    FormsModule,
    PagesRoutingModule,
  ],
  exports: [
    LoginComponent,
    MainComponent,
    HomeComponent,
    ProjectsComponent,
    CreateComponent,
    AuthRedirectComponent,
  ],
})
export class PagesModule {}
