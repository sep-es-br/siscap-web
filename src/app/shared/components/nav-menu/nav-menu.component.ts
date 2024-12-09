import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';

import {
  IMenuLink,
  MenuLinksHelper,
} from '../../../core/helpers/menu-links.helper';

@Component({
  selector: 'siscap-nav-menu',
  standalone: true,
  imports: [CommonModule, RouterModule, NgbNavModule],
  templateUrl: './nav-menu.component.html',
  styleUrl: './nav-menu.component.scss',
})
export class NavMenuComponent {
  @Input() public menuCategoriaAtiva: string = '';
  @Input() public subMenuCategoriaAtiva: string = '';

  public menuLinks: Array<IMenuLink> = MenuLinksHelper.menuLinks;
}
