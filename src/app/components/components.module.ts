import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavMenuComponent } from './navmenu/navmenu.component';
import { HeaderComponent } from './header/header.component';
import { BreadcrumbComponent } from './breadcrumb/breadcrumb.component';

@NgModule({
  declarations: [NavMenuComponent, HeaderComponent, BreadcrumbComponent],
  imports: [CommonModule],
  exports: [NavMenuComponent, HeaderComponent, BreadcrumbComponent],
})
export class ComponentsModule {}
