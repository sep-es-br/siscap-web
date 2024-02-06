import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavMenuComponent } from './navmenu/navmenu.component';
import { HeaderComponent } from './header/header.component';

@NgModule({
  declarations: [NavMenuComponent, HeaderComponent],
  imports: [CommonModule],
  exports: [NavMenuComponent, HeaderComponent],
})
export class ComponentsModule {}
