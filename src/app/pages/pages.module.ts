import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from '../pages/login/login.component';
import { HomeComponent } from '../pages/home/home.component';
import { ComponentsModule } from '../components/components.module';
import { ProjectsComponent } from './projects/projects.component';
import { CreateComponent } from './projects/create/create.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { NgSelectModule } from '@ng-select/ng-select';
import { MainComponent } from './main/main.component';
import { RouterOutlet } from '@angular/router';
import { PagesRoutingModule } from './pages-routing.module';

@NgModule({
  declarations: [
    LoginComponent,
    MainComponent,
    HomeComponent,
    ProjectsComponent,
    CreateComponent,
  ],
  imports: [
    CommonModule,
    RouterOutlet,
    ComponentsModule,
    ReactiveFormsModule,
    HttpClientModule,
    NgSelectModule,
    FormsModule,
    PagesRoutingModule
  ],
  exports: [
    LoginComponent,
    MainComponent,
    HomeComponent,
    ProjectsComponent,
    CreateComponent,
  ],
})
export class PagesModule {}
