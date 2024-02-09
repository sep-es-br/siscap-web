import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from '../pages/login/login.component';
import { HomeComponent } from '../pages/home/home.component';
import { ComponentsModule } from '../components/components.module';
import { ProjectsComponent } from './projects/projects.component';
import { CreateComponent } from './projects/create/create.component';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    LoginComponent,
    HomeComponent,
    ProjectsComponent,
    CreateComponent,
  ],
  imports: [CommonModule, ComponentsModule, ReactiveFormsModule],
  exports: [LoginComponent, HomeComponent, ProjectsComponent, CreateComponent],
})
export class PagesModule {}
