import { Component } from '@angular/core';

import { NavMenuLinks } from '../../shared/utils/navmenu-links';

@Component({
  selector: 'siscap-navmenu',
  standalone: false,
  templateUrl: './navmenu.component.html',
  styleUrl: './navmenu.component.scss',
})
export class NavMenuComponent {
  public menuLinks = NavMenuLinks.menuLinks;

  constructor() {}
}