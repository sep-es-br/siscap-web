import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from '../pages/login/login.component';
import { HomeComponent } from '../pages/home/home.component';
import { ComponentsModule } from '../components/components.module';
import { ProjectsComponent } from './projects/projects.component';

@NgModule({
  declarations: [LoginComponent, HomeComponent, ProjectsComponent],
  imports: [CommonModule, ComponentsModule],
  exports: [LoginComponent, HomeComponent, ProjectsComponent],
})
export class PagesModule {}
