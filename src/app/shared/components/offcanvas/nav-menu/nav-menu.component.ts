import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { NgbAccordionModule } from '@ng-bootstrap/ng-bootstrap';

import {
  IMenuLink,
  MenuLinksHelper,
} from '../../../../core/helpers/menu-links.helper';

@Component({
  selector: 'siscap-offcanvas-nav-menu',
  standalone: true,
  imports: [CommonModule, RouterModule, NgbAccordionModule],
  templateUrl: './nav-menu.component.html',
  styleUrl: './nav-menu.component.scss',
})
export class OffcanvasNavMenuComponent {
  @Input() public menuCategoriaAtiva: string = '';
  @Input() public subMenuCategoriaAtiva: string = '';

  @Output() public navegacaoSideMenu: EventEmitter<boolean> =
    new EventEmitter<boolean>();

  public menuLinks: Array<IMenuLink> = MenuLinksHelper.menuLinks;
}
