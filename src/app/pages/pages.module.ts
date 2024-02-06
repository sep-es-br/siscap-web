import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from '../pages/login/login.component';
import { HomeComponent } from '../pages/home/home.component';
import { ComponentsModule } from '../components/components.module';

@NgModule({
  declarations: [LoginComponent, HomeComponent],
  imports: [CommonModule, ComponentsModule],
  exports: [LoginComponent, HomeComponent],
})
export class PagesModule {}
